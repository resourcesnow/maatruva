import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryForEdit, getFlatCategories } from "@/lib/data/admin/categories";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { updateCategoryAction } from "@/lib/actions/admin/categories";

export const metadata: Metadata = { title: "Edit Category" };
export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [flatCategories, category] = await Promise.all([
    getFlatCategories(),
    getCategoryForEdit(id),
  ]);
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Edit Category</h1>
      <CategoryForm
        flatCategories={flatCategories}
        excludeId={id}
        initialValues={{
          name: category.name,
          slug: category.slug,
          parent: category.parent ? category.parent.toString() : null,
          image: category.image?.url ? category.image : null,
          order: category.order,
          isActive: category.isActive,
        }}
        action={updateCategoryAction.bind(null, id)}
      />
    </div>
  );
}
