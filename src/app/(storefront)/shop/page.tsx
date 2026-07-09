import type { Metadata } from "next";
import { getProducts, getColourOptions, type ProductSort } from "@/lib/data/products";
import { getCategoriesWithCounts } from "@/lib/data/categories";
import { ProductGrid } from "@/components/storefront/product-grid";
import { FilterSidebar } from "@/components/storefront/filters/filter-sidebar";
import { MobileFilterDrawer } from "@/components/storefront/filters/mobile-filter-drawer";
import { SortSelect } from "@/components/storefront/filters/sort-select";
import { PaginationBar } from "@/components/storefront/pagination-bar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse our full collection of handcrafted Rakhis, jewellery and gift hampers.",
};

const PER_PAGE = 12;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const categorySlugs = toArray(params.categories);
  const colours = toArray(params.colour);

  const [categories, colourOptions, { products, total }] = await Promise.all([
    getCategoriesWithCounts(),
    getColourOptions(),
    getProducts({
      categorySlugs,
      colours,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      inStockOnly: toArray(params.inStock).includes("1"),
      sort: (params.sort as ProductSort) || "newest",
      page,
      perPage: PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
      <h1 className="font-heading mb-6 text-3xl font-semibold">Shop All</h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterSidebar
          categories={categories}
          colours={colourOptions}
          basePath="/shop"
          searchParams={params}
        />
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MobileFilterDrawer
                categories={categories}
                colours={colourOptions}
                basePath="/shop"
                searchParams={params}
              />
              <p className="text-muted-foreground text-sm">{total} products</p>
            </div>
            <SortSelect basePath="/shop" />
          </div>
          <ProductGrid products={products} />
          <PaginationBar
            basePath="/shop"
            searchParams={params}
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
