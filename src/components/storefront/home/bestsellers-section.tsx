import { ProductCard } from "../product-card";
import { SectionHeading } from "./featured-banners";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { ProductCard as ProductCardType } from "@/types/catalog";

export function BestsellersSection({ products }: { products: ProductCardType[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <SectionHeading title="Bestsellers" subtitle="Loved by our customers, again and again." />
      <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <RevealItem key={product.id}>
            <ProductCard product={product} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
