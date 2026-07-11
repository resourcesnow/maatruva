import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { verifyRazorpayWebhookSignature, RazorpayConfigError } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/order-fulfillment";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let signatureValid: boolean;
  try {
    signatureValid = verifyRazorpayWebhookSignature(rawBody, signature);
  } catch (err) {
    if (err instanceof RazorpayConfigError) {
      console.error("[razorpay]", err.message);
      return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
    }
    throw err;
  }

  if (!signatureValid) {
    console.error("[razorpay] webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;

  try {
    if ((event.event === "payment.captured" || event.event === "order.paid") && razorpayOrderId) {
      await markOrderPaid(razorpayOrderId, payment.id, undefined, "Payment confirmed via webhook");
    }

    if (event.event === "payment.failed" && razorpayOrderId) {
      await connectDB();
      await Order.updateOne(
        { "payment.orderId": razorpayOrderId, "payment.status": { $ne: "paid" } },
        {
          $set: { "payment.status": "failed" },
          $push: { timeline: { status: "placed", at: new Date(), note: "Payment failed" } },
        },
      );
    }
  } catch (err) {
    console.error("[razorpay] webhook processing failed for event", event.event, err);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
