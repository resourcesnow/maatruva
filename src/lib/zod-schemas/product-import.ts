import { z } from "zod";

// Deliberately separate from `productSchema` (src/lib/zod-schemas/product.ts): that schema
// requires categories.min(1) and images.min(1), which is right for the interactive one-at-a-time
// form but wrong here — bulk-imported rows never carry categories or images (those are added
// manually per-product afterward), so this schema only covers the fields the spreadsheet
// actually supplies.
export const bulkProductRowSchema = z.object({
  title: z.string().min(2, "Title is required."),
  slug: z.string().optional(),
  sku: z.string().min(2, "SKU is required."),
  status: z.enum(["draft", "published", "archived"]).optional().default("draft"),
  price: z.coerce.number().positive("Price must be greater than 0."),
  salePrice: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional().default(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional().default(5),
  shortDescription: z.string().max(240).optional().default(""),
  description: z.string().optional().default(""),
});

export type BulkProductRowInput = z.infer<typeof bulkProductRowSchema>;

// Exact header names expected in the uploaded spreadsheet's first row — must match
// public/product-import-template.xlsx and the mapping in bulkImportProductsAction.
// "Description" here maps to the shortDescription field and "Product Highlights" maps to
// the description field — labels only, matching the admin form / storefront rename; the
// underlying field mapping is unchanged.
export const PRODUCT_IMPORT_COLUMNS = [
  "Title",
  "Slug",
  "SKU",
  "Status",
  "Price",
  "Sale Price",
  "Stock",
  "Low Stock Threshold",
  "Description",
  "Product Highlights",
] as const;
