import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getAdminCoupons } from "@/lib/data/admin/coupons";
import { CouponTable } from "@/components/admin/coupons/coupon-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/storefront/pagination-bar";

export const metadata: Metadata = { title: "Coupons" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { coupons, total } = await getAdminCoupons({ q: sp.q, page, perPage: PER_PAGE });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Coupons</h1>
        <Button render={<Link href="/admin/coupons/new" />}>
          <Plus className="size-4" /> Add Coupon
        </Button>
      </div>

      <form method="get" className="flex gap-2">
        <Input name="q" placeholder="Search by code..." defaultValue={sp.q} className="max-w-xs" />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <CouponTable coupons={coupons} />

      <PaginationBar
        basePath="/admin/coupons"
        searchParams={sp}
        currentPage={page}
        totalPages={Math.ceil(total / PER_PAGE)}
      />
    </div>
  );
}
