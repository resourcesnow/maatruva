// No "server-only" guard — needs to run from scripts/sync-shipment-status.ts (via tsx, outside
// Next's bundler). Never imported by a client component.
import type { OrderDoc } from "@/models/Order";
import type { HydratedDocument } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
  sendOrderShippedEmail,
  sendPreDeliveryReminderEmail,
  sendOrderDeliveredEmail,
} from "@/lib/order-emails";

type OrderLike = HydratedDocument<OrderDoc>;

// Every current caller already holds a connection by the time it gets here (markOrderPaid,
// applyShiprocketStatusUpdate, etc. all call connectDB() themselves first) — this call is
// defensive, not load-bearing, so a future caller that forgets to connect first doesn't
// silently buffer-timeout the way getParcelForItems() once did.
export async function resolveOrderRecipientEmail(order: OrderLike): Promise<string | null> {
  if (order.user) {
    await connectDB();
    const user = await User.findById(order.user).select("email").lean();
    return user?.email ?? null;
  }
  return order.guestEmail ?? null;
}

export async function notifyOrderConfirmed(order: OrderLike) {
  const email = await resolveOrderRecipientEmail(order);
  if (!email) {
    console.warn(`[order-notifications] order ${order.orderNo} has no recipient email — skipping.`);
    return;
  }

  await sendOrderConfirmationEmail(email, {
    orderNo: order.orderNo,
    createdAt: order.createdAt ?? new Date(),
    items: order.items.map((item) => ({
      title: item.title,
      sku: item.sku,
      price: item.price,
      qty: item.qty,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    shippingFee: order.shippingFee,
    total: order.total,
    shippingAddress: {
      name: order.shippingAddress.name,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2 ?? undefined,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      phone: order.shippingAddress.phone,
    },
    deliveryMethod: order.deliveryMethod as "delivery" | "pickup",
  });
}

export async function notifyPaymentFailed(order: OrderLike) {
  const email = await resolveOrderRecipientEmail(order);
  if (!email) return;
  await sendPaymentFailedEmail(email, { orderNo: order.orderNo, total: order.total });
}

export async function notifyOrderShipped(order: OrderLike) {
  const email = await resolveOrderRecipientEmail(order);
  if (!email) return;
  await sendOrderShippedEmail(email, {
    orderNo: order.orderNo,
    awbCode: order.shipping?.awbCode ?? undefined,
    courierName: order.shipping?.courierName ?? undefined,
    trackingUrl: order.shipping?.trackingUrl ?? undefined,
  });
}

export async function notifyPreDeliveryReminder(order: OrderLike) {
  const email = await resolveOrderRecipientEmail(order);
  if (!email || !order.shipping?.estimatedDelivery) return;
  await sendPreDeliveryReminderEmail(email, {
    orderNo: order.orderNo,
    estimatedDelivery: order.shipping.estimatedDelivery,
  });
}

export async function notifyOrderDelivered(order: OrderLike) {
  const email = await resolveOrderRecipientEmail(order);
  if (!email) return;
  await sendOrderDeliveredEmail(email, { orderNo: order.orderNo });
}
