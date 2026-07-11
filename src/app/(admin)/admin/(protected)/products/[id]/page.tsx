import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryTree } from "@/lib/data/categories";
import { getProductForEdit } from "@/lib/data/admin/products";
import { ProductForm } from "@/components/admin/products/product-form";
import { updateProductAction } from "@/lib/actions/admin/products";

export const metadata: Metadata = { title: "Edit Product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([getCategoryTree(), getProductForEdit(id)]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Edit Product</h1>
      <ProductForm
        categories={categories}
        initialValues={{
          title: product.title,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price,
          salePrice: product.salePrice,
          categories: product.categories.map((c: string) => c.toString()),
          images: product.images,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          isFeatured: product.isFeatured,
          isBestseller: product.isBestseller,
          badges: product.badges,
          status: product.status,
        }}
        action={updateProductAction.bind(null, id)}
        productId={id}
      />
    </div>
  );
}
