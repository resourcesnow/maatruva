import type { Metadata } from "next";
import { CouponForm } from "@/components/admin/coupons/coupon-form";
import { createCouponAction } from "@/lib/actions/admin/coupons";

export const metadata: Metadata = { title: "New Coupon" };

export default function NewCouponPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">New Coupon</h1>
      <CouponForm action={createCouponAction} />
    </div>
  );
}
