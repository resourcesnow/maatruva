import "server-only";
import { connectDB } from "@/lib/db";
import { HomeContent } from "@/models/HomeContent";

export async function getHomeContent() {
  await connectDB();
  const doc = await HomeContent.findOne().sort({ createdAt: 1 }).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as {
    heroSlides: {
      image?: string;
      publicId?: string;
      video?: string;
      heading: string;
      subheading?: string;
      ctaLabel?: string;
      ctaHref?: string;
      order: number;
    }[];
    featuredBanners: {
      image: string;
      publicId?: string;
      title: string;
      mrp?: number;
      salePrice?: number;
      ctaLabel?: string;
      ctaHref: string;
    }[];
    founders: {
      name: string;
      role?: string;
      photo?: string;
      photoPublicId?: string;
      message?: string;
    }[];
    whyChooseUs: { icon: string; title: string; text?: string }[];
    faq: { q: string; a: string }[];
    meta?: { title?: string; description?: string };
  };
}
