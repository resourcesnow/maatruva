import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().optional().default(""),
  order: z.number().int().default(0),
});

export const productSchema = z.object({
  title: z.string().min(2, "Title is required."),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, hyphen-separated."),
  sku: z.string().min(2, "SKU is required."),
  description: z.string().optional().default(""),
  shortDescription: z.string().max(240).optional().default(""),
  price: z.coerce.number().positive("Price must be greater than 0."),
  salePrice: z.coerce.number().positive().nullable().optional(),
  categories: z.array(z.string()).min(1, "Select at least one category."),
  attributes: z
    .array(z.object({ name: z.string(), value: z.string() }))
    .optional()
    .default([]),
  images: z.array(productImageSchema).min(1, "Add at least one image."),
  video: z.object({ url: z.string().url(), publicId: z.string() }).nullable().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isFeatured: z.boolean().optional().default(false),
  isBestseller: z.boolean().optional().default(false),
  badges: z.array(z.string()).optional().default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
