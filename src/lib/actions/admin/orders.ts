"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { logAdminAction } from "@/lib/audit";
import { getShiprocketTracking, ShiprocketConfigError } from "@/lib/shiprocket";
import { applyShiprocketStatusUpdate } from "@/lib/shipment-status";
import { parseShiprocketEdd } from "@/lib/shipment-eta";
import type { OrderStatus } from "@/types/order";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus, note?: string) {
  const session = await auth();
  requireRole(session, roleMatrix.ordersManage);

  await connectDB();
  const order = await Order.findByIdAndUpdate(orderId, {
    status,
    $push: { timeline: { status, at: new Date(), note } },
  });

  // Cancelling restocks items — this only ever runs once per order since the status check
  // prevents restocking twice for the same cancellation.
  if (order && status === "cancelled" && order.status !== "cancelled") {
    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.qty } });
    }
  }

  if (order) {
    await logAdminAction(session, {
      action: "status_change",
      entityType: "Order",
      entityId: orderId,
      entityLabel: `#${order.orderNo} → ${status}`,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, error: null };
}

// Polling-based tracking refresh — there's no Shiprocket webhook configured yet (no publicly
// reachable URL to register), so tracking updates happen on-demand from the admin order page.
export async function refreshShipmentTrackingAction(orderId: string) {
  const session = await auth();
  requireRole(session, roleMatrix.ordersManage);

  await connectDB();
  const order = await Order.findById(orderId);
  if (!order?.shipping?.shipmentId) {
    return { ok: false, error: "No Shiprocket shipment exists for this order yet." };
  }

  try {
    const data = await getShiprocketTracking(order.shipping.shipmentId);
    const track = data.tracking_data?.shipment_track?.[0];
    await applyShiprocketStatusUpdate(order, {
      currentStatus: track?.current_status ?? data.tracking_data?.shipment_status,
      awbCode: track?.awb_code,
      courierName: track?.courier_name,
      estimatedDelivery: parseShiprocketEdd(data.tracking_data?.edd ?? data.tracking_data?.etd),
    });
  } catch (err) {
    if (err instanceof ShiprocketConfigError) {
      return { ok: false, error: err.message };
    }
    const message = err instanceof Error ? err.message : String(err);
    order.shipping.lastError = message;
    await order.save();
    return { ok: false, error: message };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, error: null };
}
