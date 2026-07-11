"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { logAdminAction } from "@/lib/audit";
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
