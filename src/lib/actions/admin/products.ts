"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/zod-schemas/product";

async function requireProductManager() {
  const session = await auth();
  requireRole(session, ["admin", "shop_manager"]);
  return session!;
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    description: formData.get("description") || "",
    shortDescription: formData.get("shortDescription") || "",
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || null,
    categories: formData.getAll("categories"),
    images: JSON.parse((formData.get("images") as string) || "[]"),
    stock: formData.get("stock") || 0,
    lowStockThreshold: formData.get("lowStockThreshold") || 5,
    isFeatured: formData.get("isFeatured") === "on",
    isBestseller: formData.get("isBestseller") === "on",
    badges:
      (formData.get("badges") as string)
        ?.split(",")
        .map((b) => b.trim())
        .filter(Boolean) ?? [],
    status: formData.get("status") || "draft",
  });
}

export async function createProductAction(_prevState: unknown, formData: FormData) {
  await requireProductManager();
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  const existing = await Product.findOne({
    $or: [{ slug: parsed.data.slug }, { sku: parsed.data.sku }],
  });
  if (existing) {
    return { ok: false, error: "A product with this slug or SKU already exists." };
  }

  const product = await Product.create(parsed.data);
  revalidatePath("/admin/products");
  return { ok: true, error: null, id: product._id.toString() };
}

export async function updateProductAction(
  productId: string,
  _prevState: unknown,
  formData: FormData,
) {
  await requireProductManager();
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await connectDB();
  const duplicate = await Product.findOne({
    _id: { $ne: productId },
    $or: [{ slug: parsed.data.slug }, { sku: parsed.data.sku }],
  });
  if (duplicate) {
    return { ok: false, error: "Another product already uses this slug or SKU." };
  }

  await Product.findByIdAndUpdate(productId, parsed.data);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, error: null };
}

export async function archiveProductAction(productId: string) {
  await requireProductManager();
  await connectDB();
  await Product.findByIdAndUpdate(productId, { status: "archived" });
  revalidatePath("/admin/products");
}

export async function publishProductAction(productId: string) {
  await requireProductManager();
  await connectDB();
  await Product.findByIdAndUpdate(productId, { status: "published" });
  revalidatePath("/admin/products");
}

export async function deleteProductAction(productId: string) {
  await requireProductManager();
  await connectDB();
  await Product.findByIdAndDelete(productId);
  revalidatePath("/admin/products");
}
