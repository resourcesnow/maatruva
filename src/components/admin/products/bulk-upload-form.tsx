"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkImportProductsAction } from "@/lib/actions/admin/products";

type Skip = { row: number; title?: string; reason: string };

const initialState = {
  ok: false,
  error: null as string | null,
  created: 0,
  skipped: [] as Skip[],
};

export function BulkUploadForm() {
  const [state, formAction, pending] = useActionState(bulkImportProductsAction, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok && state.created > 0) {
      toast.success(
        `${state.created} product${state.created === 1 ? "" : "s"} created. Add category and photos for each from the products list.`,
      );
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-border flex flex-col gap-4 rounded-xl border p-5">
        <p className="text-muted-foreground text-sm">
          Upload an Excel file (.xlsx) with columns for Title, Slug, SKU, Status, Price, Sale Price,
          Stock, Low Stock Threshold, Short Description, and Description. Category and photos
          aren&apos;t part of this file — add those per product afterward from the products list.
        </p>

        <a
          href="/product-import-template.xlsx"
          download
          className="text-primary inline-flex w-fit items-center gap-2 text-sm font-medium underline"
        >
          <Download className="size-3.5" /> Download the template file
        </a>

        <form action={formAction} className="flex flex-col gap-3">
          <input
            type="file"
            name="file"
            accept=".xlsx,.xls"
            required
            className="border-border file:bg-secondary file:text-secondary-foreground rounded-lg border p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          <Button type="submit" disabled={pending} className="w-fit">
            <Upload className="size-4" />
            {pending ? "Uploading..." : "Upload & Import"}
          </Button>
        </form>
      </div>

      {state.ok && (state.created > 0 || state.skipped.length > 0) && (
        <div className="border-border flex flex-col gap-3 rounded-xl border p-5">
          <p className="text-sm font-medium">
            {state.created} created, {state.skipped.length} skipped.
          </p>

          {state.skipped.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {state.skipped.map((row, i) => (
                <p key={i} className="text-muted-foreground text-sm">
                  Row {row.row}
                  {row.title ? ` — ${row.title}` : ""} — {row.reason}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
