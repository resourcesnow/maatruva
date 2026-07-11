import type { Metadata } from "next";
import { getCategoryTree } from "@/lib/data/categories";
import { ProductForm } from "@/components/admin/products/product-form";
import { createProductAction } from "@/lib/actions/admin/products";

export const metadata: Metadata = { title: "New Product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategoryTree();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">New Product</h1>
      <ProductForm categories={categories} action={createProductAction} />
    </div>
  );
}
