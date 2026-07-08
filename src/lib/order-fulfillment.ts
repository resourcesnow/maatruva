import "server-only";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";

export async function markOrderPaid(
  razorpayOrderId: string,
  paymentId: string,
  signature: string | undefined,
  note: string,
) {
  await connectDB();

  const order = await Order.findOneAndUpdate(
    { "payment.orderId": razorpayOrderId, "payment.status": { $ne: "paid" } },
    {
      $set: {
        "payment.paymentId": paymentId,
        "payment.signature": signature,
        "payment.status": "paid",
        status: "confirmed",
      },
      $push: { timeline: { status: "confirmed", at: new Date(), note } },
    },
    { returnDocument: "after" },
  );

  if (!order) return null;

  if (order.coupon?.code) {
    await Coupon.updateOne({ code: order.coupon.code }, { $inc: { usedCount: 1 } });
  }
  for (const item of order.items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.qty } });
  }

  return order;
}
