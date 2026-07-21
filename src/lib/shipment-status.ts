// No "server-only" guard — needs to run from scripts/sync-shipment-status.ts (via tsx, outside
// Next's bundler). Never imported by a client component.
import type { OrderDoc } from "@/models/Order";
import type { HydratedDocument } from "mongoose";
import type { OrderStatus } from "@/types/order";
import { connectDB } from "@/lib/db";
import { notifyOrderShipped, notifyOrderDelivered } from "@/lib/order-notifications";

// Shiprocket's shipment status strings, mapped to our order status enum. Shared by the webhook
// handler, the admin "Refresh tracking" action, and the periodic sync script — one mapping,
// used everywhere a Shiprocket status needs to become an order status.
export const SHIPROCKET_STATUS_MAP: Record<string, OrderStatus> = {
  "picked up": "packed",
  "pickup generated": "packed",
  "in transit": "shipped",
  shipped: "shipped",
  "out for delivery": "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
  canceled: "cancelled",
  rto: "cancelled",
};

export async function applyShiprocketStatusUpdate(
  order: HydratedDocument<OrderDoc>,
  update: {
    currentStatus?: string;
    awbCode?: string;
    courierName?: string;
    estimatedDelivery?: Date;
  },
) {
  // Every current caller (the webhook route, refreshShipmentTrackingAction,
  // sync-shipment-status.ts) already connects before calling this — defensive only, see
  // resolveOrderRecipientEmail in order-notifications.ts for why this is worth keeping anyway.
  await connectDB();

  const mappedStatus = update.currentStatus
    ? SHIPROCKET_STATUS_MAP[update.currentStatus.toLowerCase()]
    : undefined;
  const previousStatus = order.status;

  order.shipping = {
    ...order.shipping,
    provider: order.shipping?.provider ?? "shiprocket",
    status: update.currentStatus ?? order.shipping?.status,
    awbCode: update.awbCode ?? order.shipping?.awbCode,
    courierName: update.courierName ?? order.shipping?.courierName,
    estimatedDelivery: update.estimatedDelivery ?? order.shipping?.estimatedDelivery,
    lastError: undefined,
  };

  if (mappedStatus && mappedStatus !== previousStatus) {
    order.status = mappedStatus;
    order.timeline.push({
      status: mappedStatus,
      at: new Date(),
      note: `Shiprocket: ${update.currentStatus}`,
    });
  }

  await order.save();

  if (mappedStatus && mappedStatus !== previousStatus) {
    if (mappedStatus === "shipped") {
      notifyOrderShipped(order).catch((err) => {
        console.error("[shipment-status] shipped notification failed", order.orderNo, err);
      });
    } else if (mappedStatus === "delivered") {
      notifyOrderDelivered(order).catch((err) => {
        console.error("[shipment-status] delivered notification failed", order.orderNo, err);
      });
    }
  }

  return order;
}
