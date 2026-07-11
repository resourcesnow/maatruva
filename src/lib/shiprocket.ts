import "server-only";

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

type TokenCache = { token: string; fetchedAt: number } | null;

declare global {
  var _shiprocketTokenCache: TokenCache | undefined;
}

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
    headers: { "Content-Type": "application/json" },
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
        "Content-Type": "application/json",
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
    const body = await res.text().catch(() => "");
    console.error(
      `[shiprocket] request failed: ${options.method ?? "GET"} ${path}`,
      res.status,
      body,
    );
    throw new Error(`Shiprocket request failed (${res.status}) for ${path}.`);
  }

  return res.json();
}

// Default parcel weight/dimensions until per-product data exists.
// TODO: replace with real per-product weight/dimensions once available (rakhi, jewellery, and
// gift hampers likely need different defaults — flagged for follow-up).
const DEFAULT_PARCEL = {
  weightKg: 0.25,
  lengthCm: 15,
  breadthCm: 10,
  heightCm: 5,
};

export type ShiprocketOrderInput = {
  orderNo: string;
  orderDate: Date;
  items: { title: string; sku: string; price: number; qty: number }[];
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
    weight: DEFAULT_PARCEL.weightKg,
    length: DEFAULT_PARCEL.lengthCm,
    breadth: DEFAULT_PARCEL.breadthCm,
    height: DEFAULT_PARCEL.heightCm,
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

export async function getShiprocketTracking(shipmentId: string) {
  return shiprocketRequest<{
    tracking_data?: {
      track_status?: number;
      shipment_status?: string;
      shipment_track?: { current_status?: string; awb_code?: string; courier_name?: string }[];
    };
  }>(`/courier/track/shipment/${shipmentId}`);
}
