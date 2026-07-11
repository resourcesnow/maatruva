import "server-only";
import type { QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";
import { resolveSort } from "@/lib/admin-sort";

const SORTABLE_FIELDS = ["createdAt", "orderNo", "total"] as const;

export async function getAdminOrders(filters: {
  q?: string;
  status?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: string;
}) {
  await connectDB();
  const query: QueryFilter<OrderDoc> = {};
  if (filters.q) query.orderNo = { $regex: filters.q, $options: "i" };
  if (filters.status) query.status = filters.status as OrderDoc["status"];

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;
  const { field, dir } = resolveSort(filters.sortBy, filters.sortDir, SORTABLE_FIELDS, "createdAt");

  const [docs, total] = await Promise.all([
    Order.find(query)
      .sort({ [field]: dir })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Order.countDocuments(query),
  ]);

  return { orders: JSON.parse(JSON.stringify(docs)), total };
}
