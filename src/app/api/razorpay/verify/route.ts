import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/order-fulfillment";

const bodySchema = z.object({
  mongoOrderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { mongoOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const isValid = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  await markOrderPaid(razorpayOrderId, razorpayPaymentId, razorpaySignature, "Payment verified");

  return NextResponse.json({ ok: true, orderId: mongoOrderId });
}
