import type { Metadata } from "next";
import { getFlatCategories } from "@/lib/data/admin/categories";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { createCategoryAction } from "@/lib/actions/admin/categories";

export const metadata: Metadata = { title: "New Category" };
export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const flatCategories = await getFlatCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">New Category</h1>
      <CategoryForm flatCategories={flatCategories} action={createCategoryAction} />
    </div>
  );
}
