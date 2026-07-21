import { NextResponse } from "next/server";
import { z } from "zod";
import { getShippingRate } from "@/lib/shipping-rate";
import { ShiprocketConfigError } from "@/lib/shiprocket";

const bodySchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
});

// Client-side preview only, used by checkout to show a shipping charge before payment — the
// authoritative charge that actually gets billed is recomputed server-side in
// /api/razorpay/order using this same getShippingRate() function, never trusted from here.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const result = await getShippingRate(parsed.data.pincode, parsed.data.items);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ShiprocketConfigError) {
      console.error("[shipping-estimate]", err.message);
      return NextResponse.json({ error: "Shipping is not configured." }, { status: 503 });
    }
    throw err;
  }
}
