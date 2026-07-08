import type { Metadata } from "next";
import { getHomeContent } from "@/lib/data/home-content";
import { HomeContentForm } from "@/components/admin/content/home-content-form";

export const metadata: Metadata = { title: "Homepage Content" };
export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const content = await getHomeContent();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">Homepage Content</h1>
      <HomeContentForm
        initial={{
          heroSlides: (content?.heroSlides ?? []).map((s) => ({
            image: s.image ?? "",
            heading: s.heading,
            subheading: s.subheading ?? "",
            ctaLabel: s.ctaLabel ?? "",
            ctaHref: s.ctaHref ?? "",
            order: s.order,
          })),
          featuredBanners: (content?.featuredBanners ?? []).map((b) => ({
            image: b.image,
            title: b.title,
            mrp: b.mrp ?? 0,
            salePrice: b.salePrice ?? 0,
            ctaLabel: b.ctaLabel ?? "",
            ctaHref: b.ctaHref,
          })),
          founders: (content?.founders ?? []).map((f) => ({
            name: f.name,
            role: f.role ?? "",
            photo: f.photo ?? "",
            message: f.message ?? "",
          })),
          whyChooseUs: (content?.whyChooseUs ?? []).map((w) => ({
            icon: w.icon,
            title: w.title,
            text: w.text ?? "",
          })),
          faq: content?.faq ?? [],
        }}
      />
    </div>
  );
}
