import type { Metadata } from "next";
import { getWishlistIds } from "@/lib/actions/wishlist";
import { getProductsByIds } from "@/lib/data/products";
import { ProductGrid } from "@/components/storefront/product-grid";

export const metadata: Metadata = { title: "My Wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const ids = await getWishlistIds();
  const products = await getProductsByIds(ids);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl font-semibold">Wishlist</h2>
      <ProductGrid products={products} />
    </div>
  );
}
