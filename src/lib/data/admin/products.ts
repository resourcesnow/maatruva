import "server-only";
import type { QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product, type ProductDoc } from "@/models/Product";
import { resolveSort } from "@/lib/admin-sort";

const SORTABLE_FIELDS = ["createdAt", "title", "price", "stock"] as const;

export async function getAdminProducts(filters: {
  q?: string;
  status?: string;
  category?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: string;
}) {
  await connectDB();
  const query: QueryFilter<ProductDoc> = {};
  if (filters.q) query.title = { $regex: filters.q, $options: "i" };
  if (filters.status) query.status = filters.status as "draft" | "published" | "archived";
  if (filters.category) query.categories = filters.category;

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;
  const { field, dir } = resolveSort(filters.sortBy, filters.sortDir, SORTABLE_FIELDS, "createdAt");

  const [docs, total] = await Promise.all([
    Product.find(query)
      .sort({ [field]: dir })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products: JSON.parse(JSON.stringify(docs)) as Array<{
      _id: string;
      title: string;
      slug: string;
      sku: string;
      price: number;
      salePrice: number | null;
      stock: number;
      lowStockThreshold: number;
      status: string;
      images: { url: string }[];
    }>,
    total,
  };
}

export async function getProductForEdit(id: string) {
  await connectDB();
  const doc = await Product.findById(id).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}
