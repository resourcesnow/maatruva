"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { couponSchema } from "@/lib/zod-schemas/coupon";
import { logAdminAction } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth();
  requireRole(session, roleMatrix.couponsManage);
  return session!;
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
  const session = await requireAdmin();
  const parsed = parseCouponForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  await connectDB();
  const existing = await Coupon.findOne({ code: parsed.data.code });
  if (existing) return { ok: false, error: "A coupon with this code already exists." };

  const coupon = await Coupon.create(parsed.data);
  await logAdminAction(session, {
    action: "create",
    entityType: "Coupon",
    entityId: coupon._id.toString(),
    entityLabel: coupon.code,
  });
  revalidatePath("/admin/coupons");
  return { ok: true, error: null };
}

export async function updateCouponAction(
  couponId: string,
  _prevState: unknown,
  formData: FormData,
) {
  const session = await requireAdmin();
  const parsed = parseCouponForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  await connectDB();
  await Coupon.findByIdAndUpdate(couponId, parsed.data);
  await logAdminAction(session, {
    action: "update",
    entityType: "Coupon",
    entityId: couponId,
    entityLabel: parsed.data.code,
  });
  revalidatePath("/admin/coupons");
  return { ok: true, error: null };
}

export async function deleteCouponAction(couponId: string) {
  const session = await requireAdmin();
  await connectDB();
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (coupon) {
    await logAdminAction(session, {
      action: "delete",
      entityType: "Coupon",
      entityId: couponId,
      entityLabel: coupon.code,
    });
  }
  revalidatePath("/admin/coupons");
  return { ok: true, error: null };
}
