import "server-only";
import type { QueryFilter, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product, type ProductDoc } from "@/models/Product";
import { getCategoryBySlug, getCategoryDescendantIds } from "./categories";
import type { ProductCard, ProductDetail } from "@/types/catalog";

type ProductCardSource = {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  images?: { url: string; publicId: string; alt?: string | null; order?: number | null }[];
  badges?: string[];
  stock?: number;
  ratingAvg?: number;
  ratingCount?: number;
};

function toProductCard(doc: ProductCardSource): ProductCard {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    price: doc.price,
    salePrice: doc.salePrice ?? null,
    images: (doc.images ?? []).map((img) => ({
      url: img.url,
      publicId: img.publicId,
      alt: img.alt ?? doc.title,
      order: img.order ?? 0,
    })),
    badges: doc.badges ?? [],
    stock: doc.stock ?? 0,
    ratingAvg: doc.ratingAvg ?? 0,
    ratingCount: doc.ratingCount ?? 0,
  };
}

export type ProductSort = "newest" | "price-asc" | "price-desc" | "popular";

export type ProductFilters = {
  categorySlug?: string;
  categorySlugs?: string[];
  colours?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
  q?: string;
};

const COLOUR_ATTRIBUTE_NAMES = ["Colour", "Color", "colour", "color"];

const SORT_MAP: Record<ProductSort, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  popular: { ratingCount: -1 },
};

export async function getProducts(filters: ProductFilters = {}) {
  await connectDB();

  const query: QueryFilter<ProductDoc> = { status: "published" };

  if (filters.categorySlug) {
    const category = await getCategoryBySlug(filters.categorySlug);
    if (!category) return { products: [], total: 0 };
    const ids = await getCategoryDescendantIds(category.id);
    query.categories = { $in: ids };
  }

  if (filters.categorySlugs?.length) {
    const idLists = await Promise.all(
      filters.categorySlugs.map(async (slug) => {
        const category = await getCategoryBySlug(slug);
        return category ? getCategoryDescendantIds(category.id) : [];
      }),
    );
    const ids = [...new Set(idLists.flat())];
    query.categories = query.categories
      ? { $in: (query.categories as { $in: string[] }).$in.filter((id) => ids.includes(id)) }
      : { $in: ids };
  }

  if (filters.colours?.length) {
    query.attributes = {
      $elemMatch: { name: { $in: COLOUR_ATTRIBUTE_NAMES }, value: { $in: filters.colours } },
    };
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    query.price = {};
    if (filters.minPrice != null) query.price.$gte = filters.minPrice;
    if (filters.maxPrice != null) query.price.$lte = filters.maxPrice;
  }

  if (filters.inStockOnly) {
    query.stock = { $gt: 0 };
  }

  if (filters.q) {
    query.$text = { $search: filters.q };
  }

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 12;
  const sort = SORT_MAP[filters.sort ?? "newest"];

  const [docs, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Product.countDocuments(query),
  ]);

  return { products: docs.map(toProductCard), total };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  await connectDB();
  const doc = await Product.findOne({ slug, status: "published" })
    .populate("categories", "name slug")
    .lean();
  if (!doc) return null;

  return {
    ...toProductCard(doc),
    sku: doc.sku,
    description: doc.description ?? "",
    shortDescription: doc.shortDescription ?? "",
    categories: (
      doc.categories as unknown as { _id: Types.ObjectId; name: string; slug: string }[]
    ).map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
    })),
    attributes: (doc.attributes ?? []).map((a) => ({ name: a.name ?? "", value: a.value ?? "" })),
    video: doc.video?.url ? { url: doc.video.url } : null,
    lowStockThreshold: doc.lowStockThreshold ?? 5,
  };
}

export async function getFeaturedProducts(limit = 8) {
  await connectDB();
  const docs = await Product.find({ status: "published", isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(toProductCard);
}

export async function getBestsellers(limit = 8) {
  await connectDB();
  const docs = await Product.find({ status: "published", isBestseller: true })
    .sort({ ratingCount: -1 })
    .limit(limit)
    .lean();
  return docs.map(toProductCard);
}

export async function getRelatedProducts(productId: string, categoryIds: string[], limit = 8) {
  await connectDB();
  const docs = await Product.find({
    status: "published",
    _id: { $ne: productId },
    categories: { $in: categoryIds },
  })
    .limit(limit)
    .lean();
  return docs.map(toProductCard);
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  await connectDB();
  const docs = await Product.find({ _id: { $in: ids } }).lean();
  return docs.map(toProductCard);
}

export async function getColourOptions(): Promise<{ value: string; count: number }[]> {
  await connectDB();
  const results = await Product.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$attributes" },
    { $match: { "attributes.name": { $in: COLOUR_ATTRIBUTE_NAMES } } },
    { $group: { _id: "$attributes.value", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r) => ({ value: r._id as string, count: r.count as number }));
}

export async function searchProducts(q: string, limit = 8) {
  if (!q.trim()) return [];
  await connectDB();
  const docs = await Product.find(
    { status: "published", $text: { $search: q } },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();
  return docs.map(toProductCard);
}
