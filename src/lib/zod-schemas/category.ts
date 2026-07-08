import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required."),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, hyphen-separated."),
  parent: z.string().nullable().optional(),
  image: z.object({ url: z.string().url(), publicId: z.string() }).nullable().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
