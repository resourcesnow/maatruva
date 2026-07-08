import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${brand.siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${brand.siteUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${brand.siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${brand.siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${brand.siteUrl}/refund`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    await connectDB();
    const [products, categories] = await Promise.all([
      Product.find({ status: "published" }).select("slug updatedAt").lean(),
      Category.find({ isActive: true }).select("slug updatedAt").lean(),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${brand.siteUrl}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${brand.siteUrl}/product-category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}
