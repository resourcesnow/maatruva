import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getAdminProducts, getProductStatusCounts } from "@/lib/data/admin/products";
import { ProductTable } from "@/components/admin/products/product-table";
import { ProductStatusFilter } from "@/components/admin/products/product-status-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/storefront/pagination-bar";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const [{ products, total }, statusCounts] = await Promise.all([
    getAdminProducts({
      q: sp.q,
      status: sp.status,
      page,
      perPage: PER_PAGE,
      sortBy: sp.sortBy,
      sortDir: sp.sortDir,
    }),
    getProductStatusCounts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Products</h1>
        <Button render={<Link href="/admin/products/new" />}>
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form method="get" className="flex gap-2">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          {sp.sortBy && <input type="hidden" name="sortBy" value={sp.sortBy} />}
          {sp.sortDir && <input type="hidden" name="sortDir" value={sp.sortDir} />}
          <Input
            name="q"
            placeholder="Search products..."
            defaultValue={sp.q}
            className="max-w-xs"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <ProductStatusFilter
          basePath="/admin/products"
          searchParams={sp}
          activeStatus={sp.status}
          counts={statusCounts}
        />
      </div>

      <ProductTable
        products={products}
        basePath="/admin/products"
        searchParams={sp}
        currentField={sp.sortBy ?? "createdAt"}
        currentDir={sp.sortDir === "asc" ? "asc" : "desc"}
        activeStatus={sp.status}
      />
      <PaginationBar
        basePath="/admin/products"
        searchParams={sp}
        currentPage={page}
        totalPages={Math.ceil(total / PER_PAGE)}
      />
    </div>
  );
}
