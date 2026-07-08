"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { categorySchema } from "@/lib/zod-schemas/category";

async function requireAdmin() {
  const session = await auth();
  requireRole(session, ["admin"]);
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
  await requireAdmin();
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  await connectDB();
  const existing = await Category.findOne({ slug: parsed.data.slug });
  if (existing) return { ok: false, error: "A category with this slug already exists." };

  await Category.create(parsed.data);
  revalidatePath("/admin/categories");
  return { ok: true, error: null };
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: unknown,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  if (parsed.data.parent === categoryId) {
    return { ok: false, error: "A category cannot be its own parent." };
  }

  await connectDB();
  const duplicate = await Category.findOne({ _id: { $ne: categoryId }, slug: parsed.data.slug });
  if (duplicate) return { ok: false, error: "Another category already uses this slug." };

  await Category.findByIdAndUpdate(categoryId, parsed.data);
  revalidatePath("/admin/categories");
  return { ok: true, error: null };
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdmin();
  await connectDB();

  const hasChildren = await Category.exists({ parent: categoryId });
  if (hasChildren) return { ok: false, error: "Delete or reassign subcategories first." };

  const hasProducts = await Product.exists({ categories: categoryId });
  if (hasProducts) return { ok: false, error: "Reassign products before deleting this category." };

  await Category.findByIdAndDelete(categoryId);
  revalidatePath("/admin/categories");
  return { ok: true, error: null };
}

export async function toggleCategoryActiveAction(categoryId: string, isActive: boolean) {
  await requireAdmin();
  await connectDB();
  await Category.findByIdAndUpdate(categoryId, { isActive });
  revalidatePath("/admin/categories");
  return { ok: true, error: null };
}
