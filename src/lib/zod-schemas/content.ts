import { z } from "zod";

export const heroSlideSchema = z.object({
  image: z.string().optional().default(""),
  publicId: z.string().optional().default(""),
  video: z.string().optional().default(""),
  heading: z.string().optional().default(""),
  subheading: z.string().optional().default(""),
  ctaLabel: z.string().optional().default(""),
  ctaHref: z.string().optional().default(""),
  order: z.coerce.number().int().default(0),
});

export const featuredBannerSchema = z.object({
  image: z.string().url(),
  publicId: z.string(),
  title: z.string().min(1),
  mrp: z.coerce.number().positive().optional(),
  salePrice: z.coerce.number().positive().optional(),
  ctaLabel: z.string().optional().default("Shop Now"),
  ctaHref: z.string().min(1),
});

export const founderSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default(""),
  photo: z.string().optional().default(""),
  photoPublicId: z.string().optional().default(""),
  message: z.string().optional().default(""),
});

export const whyChooseUsSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1),
  text: z.string().optional().default(""),
});

export const faqSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const brandStatementSchema = z.object({
  image: z.string().optional().default(""),
  publicId: z.string().optional().default(""),
  words: z.array(z.string()).default([]),
});

export const MAX_BESTSELLERS = 24;

export const bestsellersSectionSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().optional().default("Trending Bestsellers"),
  subtitle: z.string().optional().default(""),
  limit: z.coerce.number().int().min(1).max(MAX_BESTSELLERS).default(12),
});

export const homeContentSchema = z.object({
  heroSlides: z.array(heroSlideSchema).default([]),
  featuredBanners: z.array(featuredBannerSchema).default([]),
  founders: z.array(founderSchema).default([]),
  whyChooseUs: z.array(whyChooseUsSchema).default([]),
  faq: z.array(faqSchema).default([]),
  brandStatement: brandStatementSchema.optional().default({ image: "", publicId: "", words: [] }),
  bestsellersSection: bestsellersSectionSchema.optional().default({
    enabled: true,
    title: "Trending Bestsellers",
    subtitle: "",
    limit: 12,
  }),
  meta: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
});

export type HomeContentInput = z.infer<typeof homeContentSchema>;
