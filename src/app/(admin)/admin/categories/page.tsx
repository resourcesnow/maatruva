import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getAllCategoriesTree } from "@/lib/data/admin/categories";
import { CategoryTreeList } from "@/components/admin/categories/category-tree-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesTree();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Categories</h1>
        <Button render={<Link href="/admin/categories/new" />}>
          <Plus className="size-4" /> Add Category
        </Button>
      </div>
      <CategoryTreeList categories={categories} />
    </div>
  );
}
