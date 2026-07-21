// Deliberately no "server-only" guard here — this module also needs to run from the standalone
// scripts/sync-shipment-status.ts script (via tsx, outside Next's bundler), and "server-only"
// throws unconditionally in that context. It's never imported by any client component.

import { brand } from "./brand";
import { connectDB } from "./db";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // Shiprocket tokens are valid ~10 days; refresh a day early

export class ShiprocketConfigError extends Error {
  constructor(missingVar: string) {
    super(
      `Shiprocket is not configured: ${missingVar} is not set. Add it to your .env file to enable shipping.`,
    );
    this.name = "ShiprocketConfigError";
  }
}

// Thrown when Shiprocket rejects order/shipment creation specifically because the seller's
// wallet balance can't cover the shipment — a known, expected, non-broken state (not a bug).
export class ShiprocketWalletBalanceError extends Error {
  constructor(shiprocketMessage: string) {
    super(`Shipment creation failed: insufficient wallet balance (${shiprocketMessage})`);
    this.name = "ShiprocketWalletBalanceError";
  }
}

const WALLET_BALANCE_KEYWORDS = ["wallet", "balance", "insufficient", "recharge"];

function isWalletBalanceMessage(message: string) {
  const lower = message.toLowerCase();
  return WALLET_BALANCE_KEYWORDS.some((kw) => lower.includes(kw));
}

type TokenCache = { token: string; fetchedAt: number } | null;

declare global {
  var _shiprocketTokenCache: TokenCache | undefined;
}

// Shiprocket's gateway WAF blocks bare server-to-server requests (no Origin/Referer/browser
// User-Agent) with a generic 403 "Access forbidden" — indistinguishable from a real auth
// failure. Confirmed live: identical requests with these headers reach the real auth logic
// (e.g. a proper "Invalid email and password combination" response instead of the WAF block).
const SHIPROCKET_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Origin: "https://app.shiprocket.in",
  Referer: "https://app.shiprocket.in/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

async function getAuthToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email) throw new ShiprocketConfigError("SHIPROCKET_EMAIL");
  if (!password) throw new ShiprocketConfigError("SHIPROCKET_PASSWORD");

  const cached = global._shiprocketTokenCache;
  if (cached && Date.now() - cached.fetchedAt < TOKEN_TTL_MS) {
    return cached.token;
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: SHIPROCKET_HEADERS,
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[shiprocket] auth failed", res.status, body);
    throw new Error(`Shiprocket authentication failed (${res.status}).`);
  }

  const data = await res.json();
  if (!data.token) {
    console.error("[shiprocket] auth response missing token", data);
    throw new Error("Shiprocket authentication failed: no token returned.");
  }

  global._shiprocketTokenCache = { token: data.token, fetchedAt: Date.now() };
  return data.token;
}

async function shiprocketRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = await getAuthToken();

  const doRequest = async (authToken: string) =>
    fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...SHIPROCKET_HEADERS,
        Authorization: `Bearer ${authToken}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  let res = await doRequest(token);

  if (res.status === 401) {
    global._shiprocketTokenCache = null;
    const freshToken = await getAuthToken();
    res = await doRequest(freshToken);
  }

  if (!res.ok) {
    const rawBody = await res.text().catch(() => "");
    console.error(
      `[shiprocket] request failed: ${options.method ?? "GET"} ${path}`,
      res.status,
      rawBody,
    );

    const message = extractShiprocketErrorMessage(rawBody) ?? `HTTP ${res.status}`;
    if (isWalletBalanceMessage(message)) {
      throw new ShiprocketWalletBalanceError(message);
    }
    throw new Error(`Shiprocket request failed (${res.status}) for ${path}: ${message}`);
  }

  return res.json();
}

function extractShiprocketErrorMessage(rawBody: string): string | undefined {
  try {
    const parsed = JSON.parse(rawBody);
    if (typeof parsed.message === "string") return parsed.message;
    if (parsed.errors && typeof parsed.errors === "object") {
      return Object.values(parsed.errors).flat().join(", ");
    }
  } catch {
    // Not JSON — fall through and use the raw body as-is below.
  }
  return rawBody || undefined;
}

type ParcelCategory = "rakhi" | "jewellery" | "hamper" | "default";

// Placeholder weight/dimensions per product category until real per-product data exists.
// TODO: replace with real per-product weight/dimensions once available.
const CATEGORY_PARCEL_DEFAULTS: Record<
  ParcelCategory,
  { weightKg: number; lengthCm: number; breadthCm: number; heightCm: number }
> = {
  rakhi: { weightKg: 0.15, lengthCm: 12, breadthCm: 9, heightCm: 3 },
  jewellery: { weightKg: 0.25, lengthCm: 12, breadthCm: 9, heightCm: 4 },
  hamper: { weightKg: 0.75, lengthCm: 25, breadthCm: 20, heightCm: 10 },
  default: { weightKg: 0.25, lengthCm: 15, breadthCm: 10, heightCm: 5 },
};

// Matches a category slug/name (e.g. "bhai-rakhi", "Silver Rakhi") to a parcel default bucket.
export function classifyParcelCategory(label: string): ParcelCategory {
  const lower = label.toLowerCase();
  if (lower.includes("hamper") || lower.includes("gift")) return "hamper";
  if (lower.includes("jewel")) return "jewellery";
  if (lower.includes("rakhi")) return "rakhi";
  return "default";
}

// Sums weight across all items (heavier orders need a heavier parcel) and uses the largest
// single-item dimensions as a rough box size — a placeholder approximation, not real packing logic.
export function computeParcel(items: { category: ParcelCategory; qty: number }[]) {
  if (items.length === 0) return CATEGORY_PARCEL_DEFAULTS.default;

  let weightKg = 0;
  let lengthCm = 0;
  let breadthCm = 0;
  let heightCm = 0;

  for (const item of items) {
    const parcel = CATEGORY_PARCEL_DEFAULTS[item.category];
    weightKg += parcel.weightKg * item.qty;
    lengthCm = Math.max(lengthCm, parcel.lengthCm);
    breadthCm = Math.max(breadthCm, parcel.breadthCm);
    heightCm = Math.max(heightCm, parcel.heightCm);
  }

  return { weightKg, lengthCm, breadthCm, heightCm };
}

// Shared by both the pre-payment shipping-rate estimate and the post-payment real shipment
// creation, so the weight used to quote a rate is always the same weight the actual shipment
// gets booked with — imports Product/Category lazily to avoid a hard dependency for callers
// (e.g. scripts/sync-shipment-status.ts) that never need this path.
export async function getParcelForItems(items: { productId: string; qty: number }[]) {
  await connectDB();
  const { Product } = await import("@/models/Product");
  await import("@/models/Category");

  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } })
    .populate("categories", "name slug")
    .lean();
  const productById = new Map(
    products.map((p) => [
      p._id.toString(),
      p as unknown as { categories: { name: string; slug: string }[] },
    ]),
  );

  return computeParcel(
    items.map((item) => {
      const product = productById.get(item.productId);
      const categoryLabel = product?.categories?.[0]?.slug ?? product?.categories?.[0]?.name ?? "";
      return { category: classifyParcelCategory(categoryLabel), qty: item.qty };
    }),
  );
}

export type ShiprocketOrderInput = {
  orderNo: string;
  orderDate: Date;
  items: { title: string; sku: string; price: number; qty: number; category?: ParcelCategory }[];
  subtotal: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
};

export type ShiprocketOrderResult = {
  shiprocketOrderId: string;
  shipmentId: string;
};

export async function createShiprocketOrder(
  input: ShiprocketOrderInput,
): Promise<ShiprocketOrderResult> {
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
  if (!pickupLocation) throw new ShiprocketConfigError("SHIPROCKET_PICKUP_LOCATION");

  const [firstName, ...rest] = input.shippingAddress.name.trim().split(" ");
  const parcel = computeParcel(
    input.items.map((item) => ({ category: item.category ?? "default", qty: item.qty })),
  );

  const payload = {
    order_id: input.orderNo,
    order_date: input.orderDate.toISOString().slice(0, 19).replace("T", " "),
    pickup_location: pickupLocation,
    billing_customer_name: firstName || input.shippingAddress.name,
    billing_last_name: rest.join(" "),
    billing_address: input.shippingAddress.line1,
    billing_address_2: input.shippingAddress.line2 ?? "",
    billing_city: input.shippingAddress.city,
    billing_state: input.shippingAddress.state,
    billing_pincode: input.shippingAddress.pincode,
    billing_country: "India",
    billing_phone: input.shippingAddress.phone.replace(/^\+91/, ""),
    shipping_is_billing: true,
    order_items: input.items.map((item) => ({
      name: item.title,
      sku: item.sku,
      units: item.qty,
      selling_price: item.price,
    })),
    payment_method: "Prepaid",
    sub_total: input.subtotal,
    weight: parcel.weightKg,
    length: parcel.lengthCm,
    breadth: parcel.breadthCm,
    height: parcel.heightCm,
  };

  const data = await shiprocketRequest<{
    order_id: number;
    shipment_id: number;
    status: string;
    status_code: number;
  }>("/orders/create/adhoc", { method: "POST", body: payload });

  if (!data.shipment_id) {
    console.error("[shiprocket] order create response missing shipment_id", data);
    throw new Error("Shiprocket did not return a shipment ID.");
  }

  return {
    shiprocketOrderId: String(data.order_id),
    shipmentId: String(data.shipment_id),
  };
}

// A separate step from order creation: booking a courier for the shipment. This is where
// Shiprocket actually deducts wallet balance, so it's the step that fails with ₹0 balance —
// order creation above succeeds regardless of wallet balance.
export async function assignShiprocketAWB(shipmentId: string) {
  const data = await shiprocketRequest<{
    awb_assign_status?: number;
    response?: { data?: { awb_code?: string; courier_name?: string } };
    message?: string;
  }>("/courier/assign/awb", { method: "POST", body: { shipment_id: Number(shipmentId) } });

  const awbCode = data.response?.data?.awb_code;
  const courierName = data.response?.data?.courier_name;

  // Shiprocket returns HTTP 200 with an error embedded in the body for AWB assignment
  // failures (e.g. wallet balance) rather than a non-2xx status — only treat `message` as a
  // failure signal here, scoped to this specific call, not as a blanket rule across all
  // Shiprocket endpoints (a cancel-success message also happens to mention "wallet").
  if (!awbCode) {
    const message = data.message ?? "Shiprocket did not assign an AWB code.";
    if (isWalletBalanceMessage(message)) {
      throw new ShiprocketWalletBalanceError(message);
    }
    throw new Error(`Shiprocket AWB assignment failed: ${message}`);
  }
  return { awbCode, courierName };
}

// Cancels one or more orders by their Shiprocket order_id (not shipment_id). Safe to call
// whether or not an AWB was ever assigned.
export async function cancelShiprocketOrder(shiprocketOrderIds: string[]) {
  return shiprocketRequest<{ message?: string; status_code?: number }>("/orders/cancel", {
    method: "POST",
    body: { ids: shiprocketOrderIds.map(Number) },
  });
}

export type ServiceabilityResult =
  { serviceable: true; rate: number; courierName?: string; etd?: string } | { serviceable: false };

// Checks whether Shiprocket has a courier that can deliver `weightKg` from our pickup pincode
// to `deliveryPincode`, and what it costs. Always quotes a Prepaid (cod=0) rate — every order
// on this site is Razorpay-prepaid, there's no COD flow. Picks Shiprocket's own recommended
// courier when present, otherwise the cheapest available one.
export async function checkShiprocketServiceability(
  deliveryPincode: string,
  weightKg: number,
): Promise<ServiceabilityResult> {
  // Reuses the same store pincode already defined in brand.ts rather than a separate env var —
  // it's the same physical address as the SHIPROCKET_PICKUP_LOCATION pickup point registered
  // in Shiprocket's dashboard, just expressed as a raw pincode, which is what the
  // serviceability API needs instead of the named pickup location.
  const pickupPincode = brand.storeAddress.pincode;

  const params = new URLSearchParams({
    pickup_postcode: pickupPincode,
    delivery_postcode: deliveryPincode,
    weight: weightKg.toFixed(2),
    cod: "0",
  });

  const data = await shiprocketRequest<{
    data?: {
      available_courier_companies?: {
        courier_company_id: number;
        rate: number;
        courier_name: string;
        etd?: string;
      }[];
      recommended_courier_company_id?: number;
    };
  }>(`/courier/serviceability/?${params.toString()}`);

  const couriers = data.data?.available_courier_companies ?? [];
  if (couriers.length === 0) return { serviceable: false };

  const recommendedId = data.data?.recommended_courier_company_id;
  const chosen =
    couriers.find((c) => c.courier_company_id === recommendedId) ??
    couriers.reduce((cheapest, c) => (c.rate < cheapest.rate ? c : cheapest));

  return {
    serviceable: true,
    rate: Math.ceil(chosen.rate),
    courierName: chosen.courier_name,
    etd: chosen.etd,
  };
}

export async function getShiprocketTracking(shipmentId: string) {
  return shiprocketRequest<{
    tracking_data?: {
      track_status?: number;
      shipment_status?: string;
      shipment_track?: { current_status?: string; awb_code?: string; courier_name?: string }[];
      edd?: string; // estimated delivery date, e.g. "2026-07-22 20:00:00"
      etd?: string;
    };
  }>(`/courier/track/shipment/${shipmentId}`);
}
