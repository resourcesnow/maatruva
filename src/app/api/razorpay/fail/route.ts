import { NextResponse } from "next/server";
import { z } from "zod";
import { markOrderFailed } from "@/lib/order-fulfillment";

const bodySchema = z.object({
  razorpayOrderId: z.string(),
  reason: z.string().optional(),
});

// Best-effort marker for payments that fail or get abandoned client-side (declined card,
// user closes the checkout widget). Guarded by the same "not already paid" filter as
// markOrderPaid so a late/racing call here can never downgrade a genuinely paid order.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { razorpayOrderId, reason } = parsed.data;
  await markOrderFailed(
    razorpayOrderId,
    reason ? `Payment failed: ${reason}` : "Payment not completed",
  );

  return NextResponse.json({ ok: true });
}
