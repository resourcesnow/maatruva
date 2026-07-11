"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/zod-schemas/product";
import { logAdminAction } from "@/lib/audit";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";

async function cleanupProductImages(images: { publicId: string }[]) {
  await Promise.all(
    images
      .filter((img) => img.publicId && !img.publicId.startsWith("placeholder-"))
      .map((img) =>
        destroyCloudinaryAsset(img.publicId).catch((err) =>
          console.error("[cloudinary] failed to delete", img.publicId, err),
        ),
      ),
  );
}

async function requireProductManager() {
  const session = await auth();
  requireRole(session, roleMatrix.productsManage);
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
  const session = await requireProductManager();
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

  // The form pre-generates this id client-side so uploaded images already sit in the right
  // Cloudinary folder before the document exists — no upload-then-relink step.
  const draftId = formData.get("_id");
  const validDraftId = typeof draftId === "string" && /^[0-9a-f]{24}$/i.test(draftId);

  const product = await Product.create({
    ...parsed.data,
    ...(validDraftId ? { _id: draftId } : {}),
  });
  await logAdminAction(session, {
    action: "create",
    entityType: "Product",
    entityId: product._id.toString(),
    entityLabel: product.title,
  });
  revalidatePath("/admin/products");
  return { ok: true, error: null, id: product._id.toString() };
}

export async function updateProductAction(
  productId: string,
  _prevState: unknown,
  formData: FormData,
) {
  const session = await requireProductManager();
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
  await logAdminAction(session, {
    action: "update",
    entityType: "Product",
    entityId: productId,
    entityLabel: parsed.data.title,
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, error: null };
}

export async function archiveProductAction(productId: string) {
  const session = await requireProductManager();
  await connectDB();
  const product = await Product.findByIdAndUpdate(productId, { status: "archived" });
  if (product) {
    await logAdminAction(session, {
      action: "status_change",
      entityType: "Product",
      entityId: productId,
      entityLabel: `${product.title} (archived)`,
    });
  }
  revalidatePath("/admin/products");
  return { ok: true, error: null };
}

export async function publishProductAction(productId: string) {
  const session = await requireProductManager();
  await connectDB();
  const product = await Product.findByIdAndUpdate(productId, { status: "published" });
  if (product) {
    await logAdminAction(session, {
      action: "status_change",
      entityType: "Product",
      entityId: productId,
      entityLabel: `${product.title} (published)`,
    });
  }
  revalidatePath("/admin/products");
  return { ok: true, error: null };
}

export async function deleteProductAction(productId: string) {
  const session = await requireProductManager();
  await connectDB();
  const product = await Product.findByIdAndDelete(productId);
  if (product) {
    await cleanupProductImages(product.images);
    await logAdminAction(session, {
      action: "delete",
      entityType: "Product",
      entityId: productId,
      entityLabel: product.title,
    });
  }
  revalidatePath("/admin/products");
  return { ok: true, error: null };
}
