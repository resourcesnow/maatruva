import type { Metadata } from "next";
import { BulkUploadForm } from "@/components/admin/products/bulk-upload-form";

export const metadata: Metadata = { title: "Bulk Upload Products" };
export const dynamic = "force-dynamic";

export default function BulkUploadProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Bulk Upload Products</h1>
      <BulkUploadForm />
    </div>
  );
}
