import { PackageSearch } from "lucide-react";
import { ProductCard } from "./product-card";
import type { ProductCard as ProductCardType } from "@/types/catalog";

export function ProductGrid({ products }: { products: ProductCardType[] }) {
  if (products.length === 0) {
    return (
      <div className="border-border flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-24 text-center">
        <PackageSearch className="text-muted-foreground size-10" />
        <p className="font-heading text-lg">No products found</p>
        <p className="text-muted-foreground text-sm">Try adjusting your filters or search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
