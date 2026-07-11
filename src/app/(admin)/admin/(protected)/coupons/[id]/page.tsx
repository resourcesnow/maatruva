import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCouponForEdit } from "@/lib/data/admin/coupons";
import { CouponForm } from "@/components/admin/coupons/coupon-form";
import { updateCouponAction } from "@/lib/actions/admin/coupons";

export const metadata: Metadata = { title: "Edit Coupon" };
export const dynamic = "force-dynamic";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await getCouponForEdit(id);
  if (!coupon) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Edit Coupon</h1>
      <CouponForm initialValues={coupon} action={updateCouponAction.bind(null, id)} />
    </div>
  );
}
