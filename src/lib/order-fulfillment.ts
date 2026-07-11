import "server-only";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { createShiprocketOrder, ShiprocketConfigError } from "@/lib/shiprocket";
import { notifyOrderConfirmed } from "@/lib/order-notifications";

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

  // Fire-and-forget side effects: neither should block or fail the payment confirmation itself.
  notifyOrderConfirmed(order).catch((err) => {
    console.error("[order-fulfillment] order confirmation notification failed", order.orderNo, err);
  });

  if (order.deliveryMethod === "delivery") {
    createShipmentForOrder(order._id.toString()).catch((err) => {
      if (err instanceof ShiprocketConfigError) {
        console.error("[order-fulfillment]", err.message);
        return;
      }
      console.error("[order-fulfillment] shipment creation failed for", order.orderNo, err);
    });
  }

  return order;
}

export async function createShipmentForOrder(orderId: string) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) throw new Error(`Order ${orderId} not found.`);
  if (order.deliveryMethod !== "delivery") return null;
  if (order.shipping?.shipmentId) return order; // already created — avoid duplicate shipments

  const result = await createShiprocketOrder({
    orderNo: order.orderNo,
    orderDate: order.createdAt ?? new Date(),
    items: order.items.map((item) => ({
      title: item.title,
      sku: item.sku,
      price: item.price,
      qty: item.qty,
    })),
    subtotal: order.subtotal,
    shippingAddress: {
      name: order.shippingAddress.name,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2 ?? undefined,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      phone: order.shippingAddress.phone,
    },
  });

  order.shipping = {
    ...order.shipping,
    provider: "shiprocket",
    shiprocketOrderId: result.shiprocketOrderId,
    shipmentId: result.shipmentId,
  };
  await order.save();
  return order;
}
