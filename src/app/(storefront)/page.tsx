import type { Metadata } from "next";
import { getHomeContent } from "@/lib/data/home-content";
import { getProducts, getBestsellers } from "@/lib/data/products";
import { getCategoryTree } from "@/lib/data/categories";
import { MAX_BESTSELLERS } from "@/lib/zod-schemas/content";
import { formatINR } from "@/lib/format";
import { Hero } from "@/components/storefront/home/hero";
import { Collections, type Collection } from "@/components/storefront/home/collections";
import type { CategoryNode } from "@/types/catalog";
import { TrendingBestsellers } from "@/components/storefront/home/trending-bestsellers";
import { BrandStatement } from "@/components/storefront/home/brand-statement";
import { IconBoxGrid } from "@/components/storefront/home/icon-box";
import { FaqSection } from "@/components/storefront/home/faq-section";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

// Collections tiles come from whichever categories actually have an image set, at any depth —
// stores commonly wrap their real merchandising categories (Bhai Rakhi, Bhabhi Rakhi, ...) under
// a single top-level umbrella category, so "top-level only" would miss them.
function flattenCategoriesWithImage(nodes: CategoryNode[]): Collection[] {
  const tiles: Collection[] = [];
  for (const node of nodes) {
    if (node.image?.url) {
      tiles.push({
        label: node.name,
        image: node.image.url,
        href: `/product-category/${node.slug}`,
      });
    }
    tiles.push(...flattenCategoriesWithImage(node.children));
  }
  return tiles;
}

export const metadata: Metadata = {
  title: `${brand.name} — Handcrafted Rakhi Collection`,
  description: brand.tagline,
};

export default async function HomePage() {
  const [content, bhaiRakhi, bhabhiRakhi, bestsellers, categoryTree] = await Promise.all([
    getHomeContent(),
    getProducts({ categorySlug: "bhai-rakhi", perPage: 12 }),
    getProducts({ categorySlug: "bhabhi-rakhi", perPage: 12 }),
    getBestsellers(MAX_BESTSELLERS),
    getCategoryTree(),
  ]);

  const collectionTiles = flattenCategoriesWithImage(categoryTree);

  const bestsellersConfig = content?.bestsellersSection ?? {
    enabled: true,
    title: "Trending Bestsellers",
    subtitle: "Our most loved rakhis, chosen by thousands of sisters.",
    limit: 12,
  };

  const bhaiRakhiProducts = bhaiRakhi.products.map((p) => ({
    name: p.title,
    price: formatINR(p.salePrice ?? p.price),
    image: p.images[0]?.url ?? "",
    href: `/product/${p.slug}`,
  }));

  const bhabhiRakhiProducts = bhabhiRakhi.products.map((p) => ({
    name: p.title,
    price: formatINR(p.salePrice ?? p.price),
    image: p.images[0]?.url ?? "",
    href: `/product/${p.slug}`,
  }));

  const bestsellerProducts = bestsellersConfig.enabled
    ? bestsellers.slice(0, bestsellersConfig.limit).map((p) => ({
        name: p.title,
        price: formatINR(p.salePrice ?? p.price),
        image: p.images[0]?.url ?? "",
        href: `/product/${p.slug}`,
      }))
    : [];

  return (
    <div className="bg-porcelain">
      <Hero slides={content?.heroSlides ?? []} />
      <Collections items={collectionTiles} />
      <TrendingBestsellers
        title={bestsellersConfig.title}
        subtitle={bestsellersConfig.subtitle}
        products={bestsellerProducts}
      />
      <BrandStatement
        image={content?.brandStatement?.image ?? ""}
        words={content?.brandStatement?.words ?? []}
        founders={(content?.founders ?? []).slice(0, 2)}
      />
      <TrendingBestsellers title="Bhai Rakhi" products={bhaiRakhiProducts} />
      <TrendingBestsellers
        title="Bhabhi Rakhi"
        subtitle="Beautiful Rakhis for your special Bhabhi"
        products={bhabhiRakhiProducts}
      />
      <IconBoxGrid items={content?.whyChooseUs ?? []} />
      <FaqSection items={(content?.faq ?? []).map((f) => ({ question: f.q, answer: f.a }))} />
    </div>
  );
}
