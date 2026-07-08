import type { Metadata } from "next";
import { searchProducts } from "@/lib/data/products";
import { ProductGrid } from "@/components/storefront/product-grid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const products = q ? await searchProducts(q, 24) : [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
      <h1 className="font-heading mb-2 text-3xl font-semibold">Search Results</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        {q ? `${products.length} results for "${q}"` : "Enter a search term to find products."}
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
