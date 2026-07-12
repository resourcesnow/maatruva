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
            publicId: s.publicId ?? "",
            heading: s.heading ?? "",
            subheading: s.subheading ?? "",
            ctaLabel: s.ctaLabel ?? "",
            ctaHref: s.ctaHref ?? "",
            order: s.order,
          })),
          featuredBanners: (content?.featuredBanners ?? []).map((b) => ({
            image: b.image,
            publicId: b.publicId ?? "",
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
            photoPublicId: f.photoPublicId ?? "",
            message: f.message ?? "",
          })),
          whyChooseUs: (content?.whyChooseUs ?? []).map((w) => ({
            icon: w.icon,
            title: w.title,
            text: w.text ?? "",
          })),
          faq: content?.faq ?? [],
          brandStatement: {
            image: content?.brandStatement?.image ?? "",
            publicId: content?.brandStatement?.publicId ?? "",
            words: [
              content?.brandStatement?.words?.[0] ?? "",
              content?.brandStatement?.words?.[1] ?? "",
              content?.brandStatement?.words?.[2] ?? "",
            ],
          },
          bestsellersSection: {
            enabled: content?.bestsellersSection?.enabled ?? true,
            title: content?.bestsellersSection?.title ?? "Trending Bestsellers",
            subtitle: content?.bestsellersSection?.subtitle ?? "",
            limit: content?.bestsellersSection?.limit ?? 12,
          },
        }}
      />
    </div>
  );
}
