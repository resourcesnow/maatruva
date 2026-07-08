import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/lib/data/admin/products";
import { ProductTable } from "@/components/admin/products/product-table";
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
  const { products, total } = await getAdminProducts({
    q: sp.q,
    status: sp.status,
    page,
    perPage: PER_PAGE,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Products</h1>
        <Button render={<Link href="/admin/products/new" />}>
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      <form method="get" className="flex gap-2">
        <Input name="q" placeholder="Search products..." defaultValue={sp.q} className="max-w-xs" />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <ProductTable products={products} />
      <PaginationBar
        basePath="/admin/products"
        searchParams={sp}
        currentPage={page}
        totalPages={Math.ceil(total / PER_PAGE)}
      />
    </div>
  );
}
