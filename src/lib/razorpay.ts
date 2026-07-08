import Razorpay from "razorpay";
import { createHmac } from "crypto";

let client: Razorpay | null = null;

export function getRazorpayClient() {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }
  return client;
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return expected === params.signature;
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string) {
  const expected = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET as string)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
