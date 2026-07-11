import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";

export class RazorpayConfigError extends Error {
  constructor(missingVar: string) {
    super(
      `Razorpay is not configured: ${missingVar} is not set. Add it to your .env file to enable payments.`,
    );
    this.name = "RazorpayConfigError";
  }
}

let client: Razorpay | null = null;

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId) throw new RazorpayConfigError("RAZORPAY_KEY_ID");
  if (!keySecret) throw new RazorpayConfigError("RAZORPAY_KEY_SECRET");

  if (!client) {
    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return client;
}

function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new RazorpayConfigError("RAZORPAY_KEY_SECRET");

  const expected = createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return safeCompare(expected, params.signature);
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) throw new RazorpayConfigError("RAZORPAY_WEBHOOK_SECRET");

  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return safeCompare(expected, signature);
}
