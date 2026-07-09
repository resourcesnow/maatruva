import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getApprovedReviews } from "@/lib/data/reviews";
import { Gallery } from "@/components/storefront/product/gallery";
import { Price } from "@/components/storefront/price";
import { ProductActions } from "@/components/storefront/product/product-actions";
import { ReviewForm } from "@/components/storefront/product/review-form";
import { ReviewList, ReviewSummary } from "@/components/storefront/product/review-list";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, RotateCcw } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(
      product.id,
      product.categories.map((c) => c.id),
    ),
    getApprovedReviews(product.id),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images.map((i) => i.url),
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: brand.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.salePrice ?? product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.ratingCount,
          }
        : undefined,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Gallery images={product.images} title={product.title} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            {product.badges.map((badge) => (
              <Badge key={badge} className="bg-brand-accent text-brand-accent-foreground">
                {badge}
              </Badge>
            ))}
          </div>
          <h1 className="font-heading text-3xl font-semibold">{product.title}</h1>
          {product.ratingCount > 0 && (
            <ReviewSummary avg={product.ratingAvg} count={product.ratingCount} />
          )}
          <Price price={product.price} salePrice={product.salePrice} size="lg" />
          <p className="text-muted-foreground">{product.shortDescription}</p>

          <ProductActions product={product} />

          {product.categories.length > 0 && (
            <div className="border-border flex flex-wrap items-center gap-2 border-t pt-4 text-sm">
              <span className="text-muted-foreground">Categories:</span>
              {product.categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/product-category/${c.slug}`}
                  className="text-brand-secondary hover:underline"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <div className="border-border text-muted-foreground flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="size-4 shrink-0" /> Delivered in 3-5 business days across India.
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="size-4 shrink-0" /> Easy 7-day returns on unused items.
            </div>
          </div>
        </div>
      </div>

      <Reveal className="mt-16">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            {product.attributes.length > 0 && (
              <TabsTrigger value="additional-info">Additional Information</TabsTrigger>
            )}
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="max-w-3xl pt-4 text-sm leading-relaxed">
            {product.description}
          </TabsContent>
          {product.attributes.length > 0 && (
            <TabsContent value="additional-info" className="max-w-2xl pt-4">
              <table className="w-full text-sm">
                <tbody>
                  {product.attributes.map((attr) => (
                    <tr key={attr.name} className="border-border border-b last:border-0">
                      <th className="text-muted-foreground w-1/3 py-2 pr-4 text-left font-medium">
                        {attr.name}
                      </th>
                      <td className="py-2">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>
          )}
          <TabsContent value="reviews" className="flex max-w-2xl flex-col gap-6 pt-4">
            <ReviewForm productId={product.id} />
            <ReviewList reviews={reviews} />
          </TabsContent>
        </Tabs>
      </Reveal>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading mb-6 text-2xl font-semibold">You May Also Like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
