import { z } from "zod";

export const heroSlideSchema = z.object({
  image: z.string().url().optional().default(""),
  publicId: z.string().optional().default(""),
  video: z.string().optional().default(""),
  heading: z.string().min(1),
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
  photo: z.string().url().optional().default(""),
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

export const homeContentSchema = z.object({
  heroSlides: z.array(heroSlideSchema).default([]),
  featuredBanners: z.array(featuredBannerSchema).default([]),
  founders: z.array(founderSchema).default([]),
  whyChooseUs: z.array(whyChooseUsSchema).default([]),
  faq: z.array(faqSchema).default([]),
  meta: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
});

export type HomeContentInput = z.infer<typeof homeContentSchema>;
