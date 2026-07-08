import "server-only";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export async function getAdminCoupons() {
  await connectDB();
  const docs = await Coupon.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function getCouponForEdit(id: string) {
  await connectDB();
  const doc = await Coupon.findById(id).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}
