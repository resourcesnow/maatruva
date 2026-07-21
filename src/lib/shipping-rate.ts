import "server-only";
import {
  getParcelForItems,
  checkShiprocketServiceability,
  ShiprocketConfigError,
} from "./shiprocket";

// Placeholder flat rate used only when Shiprocket's serviceability API itself fails or times
// out (network error, 5xx, timeout) — NOT used when Shiprocket successfully responds that a
// pincode has zero available couriers, which is a real "not serviceable" result, not a
// failure. Client decision: deliberately set above the typical real rate (~₹54-105 seen in
// testing) — better to slightly overcharge on the rare fallback case than risk a loss.
const FALLBACK_SHIPPING_FEE = 75;
const SERVICEABILITY_TIMEOUT_MS = 8000;

export type ShippingRateResult =
  | { status: "ok"; rate: number; courierName?: string; etd?: string }
  | { status: "not_serviceable" }
  | { status: "fallback"; rate: number };

export async function getShippingRate(
  deliveryPincode: string,
  items: { productId: string; qty: number }[],
): Promise<ShippingRateResult> {
  const parcel = await getParcelForItems(items);

  try {
    const result = await withTimeout(
      checkShiprocketServiceability(deliveryPincode, parcel.weightKg),
      SERVICEABILITY_TIMEOUT_MS,
    );
    if (!result.serviceable) return { status: "not_serviceable" };
    return { status: "ok", rate: result.rate, courierName: result.courierName, etd: result.etd };
  } catch (err) {
    if (err instanceof ShiprocketConfigError) throw err;
    console.error(
      "[shipping-rate] Shiprocket serviceability check failed, using fallback rate",
      err,
    );
    return { status: "fallback", rate: FALLBACK_SHIPPING_FEE };
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Shiprocket request timed out")), ms),
    ),
  ]);
}
