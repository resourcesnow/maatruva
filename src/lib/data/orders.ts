import "server-only";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import type { OrderSummary } from "@/types/order";

export async function getUserOrders(userId: string): Promise<OrderSummary[]> {
  await connectDB();
  const docs = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getOrderById(id: string): Promise<OrderSummary | null> {
  await connectDB();
  const doc = await Order.findById(id)
    .lean()
    .catch(() => null);
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

export async function getOrderByOrderNo(orderNo: string): Promise<OrderSummary | null> {
  await connectDB();
  const doc = await Order.findOne({ orderNo }).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}
