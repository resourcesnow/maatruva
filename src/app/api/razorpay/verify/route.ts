import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyRazorpaySignature, RazorpayConfigError } from "@/lib/razorpay";
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

  let isValid: boolean;
  try {
    isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });
  } catch (err) {
    if (err instanceof RazorpayConfigError) {
      console.error("[razorpay]", err.message);
      return NextResponse.json({ error: "Payments are not available right now." }, { status: 503 });
    }
    throw err;
  }

  if (!isValid) {
    console.error("[razorpay] signature mismatch for order", mongoOrderId);
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  await markOrderPaid(razorpayOrderId, razorpayPaymentId, razorpaySignature, "Payment verified");

  return NextResponse.json({ ok: true, orderId: mongoOrderId });
}
