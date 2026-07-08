import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getAdminCoupons } from "@/lib/data/admin/coupons";
import { CouponTable } from "@/components/admin/coupons/coupon-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Coupons" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Coupons</h1>
        <Button render={<Link href="/admin/coupons/new" />}>
          <Plus className="size-4" /> Add Coupon
        </Button>
      </div>
      <CouponTable coupons={coupons} />
    </div>
  );
}
