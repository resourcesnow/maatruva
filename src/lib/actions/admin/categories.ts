"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, roleMatrix } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { categorySchema } from "@/lib/zod-schemas/category";
import { logAdminAction } from "@/lib/audit";
import { destroyCloudinaryAsset } from "@/lib/cloudinary";

async function requireAdmin() {
  const session = await auth();
  requireRole(session, roleMatrix.categoriesManage);
  return session!;
}

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    parent: formData.get("parent") || null,
    image: formData.get("imageUrl")
      ? { url: formData.get("imageUrl"), publicId: formData.get("imagePublicId") || "" }
      : null,
    order: formData.get("order") || 0,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCategoryAction(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  await connectDB();
  const existing = await Category.findOne({ slug: parsed.data.slug });
  if (existing) return { ok: false, error: "A category with this slug already exists." };

  const category = await Category.create(parsed.data);
  await logAdminAction(session, {
    action: "create",
    entityType: "Category",
    entityId: category._id.toString(),
    entityLabel: category.name,
  });
  revalidatePath("/admin/categories");
  return { ok: true, error: null };
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: unknown,
  formData: FormData,
) {
  const session = await requireAdmin();
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  if (parsed.data.parent === categoryId) {
    return { ok: false, error: "A category cannot be its own parent." };
  }

  await connectDB();
  const duplicate = await Category.findOne({ _id: { $ne: categoryId }, slug: parsed.data.slug });
  if (duplicate) return { ok: false, error: "Another category already uses this slug." };

  await Category.findByIdAndUpdate(categoryId, parsed.data);
  await logAdminAction(session, {
    action: "update",
    entityType: "Category",
    entityId: categoryId,
    entityLabel: parsed.data.name,
  });
  revalidatePath("/admin/categories");
  return { ok: true, error: null };
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await requireAdmin();
  await connectDB();

  const hasChildren = await Category.exists({ parent: categoryId });
  if (hasChildren) return { ok: false, error: "Delete or reassign subcategories first." };

  const hasProducts = await Product.exists({ categories: categoryId });
  if (hasProducts) return { ok: false, error: "Reassign products before deleting this category." };

  const category = await Category.findByIdAndDelete(categoryId);
  if (category) {
    if (category.image?.publicId && !category.image.publicId.startsWith("placeholder-")) {
      await destroyCloudinaryAsset(category.image.publicId).catch((err) =>
        console.error("[cloudinary] failed to delete", category.image?.publicId, err),
      );
    }
    await logAdminAction(session, {
      action: "delete",
      entityType: "Category",
      entityId: categoryId,
      entityLabel: category.name,
    });
  }
  revalidatePath("/admin/categories");
  return { ok: true, error: null };
}

export async function toggleCategoryActiveAction(categoryId: string, isActive: boolean) {
  const session = await requireAdmin();
  await connectDB();
  const category = await Category.findByIdAndUpdate(categoryId, { isActive });
  if (category) {
    await logAdminAction(session, {
      action: isActive ? "reactivate" : "deactivate",
      entityType: "Category",
      entityId: categoryId,
      entityLabel: category.name,
    });
  }
  revalidatePath("/admin/categories");
  return { ok: true, error: null };
}
