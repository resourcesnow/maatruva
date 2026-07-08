import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/order-fulfillment";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;

  if ((event.event === "payment.captured" || event.event === "order.paid") && razorpayOrderId) {
    await markOrderPaid(razorpayOrderId, payment.id, undefined, "Payment confirmed via webhook");
  }

  if (event.event === "payment.failed" && razorpayOrderId) {
    await connectDB();
    await Order.updateOne(
      { "payment.orderId": razorpayOrderId },
      { $set: { "payment.status": "failed" } },
    );
  }

  return NextResponse.json({ ok: true });
}
