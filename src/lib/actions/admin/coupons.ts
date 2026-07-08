"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { couponSchema } from "@/lib/zod-schemas/coupon";

async function requireAdmin() {
  const session = await auth();
  requireRole(session, ["admin"]);
}

function parseCouponForm(formData: FormData) {
  return couponSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    minOrder: formData.get("minOrder") || 0,
    maxDiscount: formData.get("maxDiscount") || null,
    startsAt: formData.get("startsAt") || new Date().toISOString(),
    expiresAt: formData.get("expiresAt"),
    usageLimit: formData.get("usageLimit") || null,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCouponAction(_prevState: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = parseCouponForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  await connectDB();
  const existing = await Coupon.findOne({ code: parsed.data.code });
  if (existing) return { ok: false, error: "A coupon with this code already exists." };

  await Coupon.create(parsed.data);
  revalidatePath("/admin/coupons");
  return { ok: true, error: null };
}

export async function updateCouponAction(
  couponId: string,
  _prevState: unknown,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = parseCouponForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  await connectDB();
  await Coupon.findByIdAndUpdate(couponId, parsed.data);
  revalidatePath("/admin/coupons");
  return { ok: true, error: null };
}

export async function deleteCouponAction(couponId: string) {
  await requireAdmin();
  await connectDB();
  await Coupon.findByIdAndDelete(couponId);
  revalidatePath("/admin/coupons");
}
