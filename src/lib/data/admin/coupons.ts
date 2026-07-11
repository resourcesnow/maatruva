import "server-only";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export async function getAdminCoupons(
  filters: { q?: string; page?: number; perPage?: number } = {},
) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters.q) query.code = { $regex: filters.q, $options: "i" };

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;

  const [docs, total] = await Promise.all([
    Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Coupon.countDocuments(query),
  ]);

  return { coupons: JSON.parse(JSON.stringify(docs)), total };
}

export async function getCouponForEdit(id: string) {
  await connectDB();
  const doc = await Coupon.findById(id).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}
