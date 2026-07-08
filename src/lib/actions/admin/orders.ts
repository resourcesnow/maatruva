"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import type { OrderStatus } from "@/types/order";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus, note?: string) {
  const session = await auth();
  requireRole(session, ["admin"]);

  await connectDB();
  await Order.findByIdAndUpdate(orderId, {
    status,
    $push: { timeline: { status, at: new Date(), note } },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
