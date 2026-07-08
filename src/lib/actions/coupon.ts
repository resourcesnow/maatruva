"use server";

import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export async function validateCouponAction(code: string, subtotal: number) {
  await connectDB();
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) return { ok: false as const, error: "Invalid coupon code." };
  if (coupon.expiresAt < new Date()) return { ok: false as const, error: "Coupon has expired." };
  if (coupon.startsAt > new Date())
    return { ok: false as const, error: "Coupon is not active yet." };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false as const, error: "Coupon usage limit reached." };
  }
  if (subtotal < coupon.minOrder) {
    return {
      ok: false as const,
      error: `Minimum order of ₹${coupon.minOrder} required for this coupon.`,
    };
  }

  let discount = coupon.type === "flat" ? coupon.value : (subtotal * coupon.value) / 100;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);

  return { ok: true as const, discount: Math.round(discount), code: coupon.code };
}
