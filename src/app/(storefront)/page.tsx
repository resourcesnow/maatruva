import type { Metadata } from "next";
import { getHomeContent } from "@/lib/data/home-content";
import { getBestsellers } from "@/lib/data/products";
import { Hero } from "@/components/storefront/home/hero";
import { FeaturedBanners } from "@/components/storefront/home/featured-banners";
import { BestsellersSection } from "@/components/storefront/home/bestsellers-section";
import { FoundersSection } from "@/components/storefront/home/founders-section";
import { WhyChooseUsSection } from "@/components/storefront/home/why-choose-us";
import { FaqSection } from "@/components/storefront/home/faq-section";
import { NewsletterCta } from "@/components/storefront/home/newsletter-cta";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${brand.name} — Handcrafted Rakhi & Jewellery`,
  description: brand.tagline,
};

export default async function HomePage() {
  const [content, bestsellers] = await Promise.all([getHomeContent(), getBestsellers(8)]);

  return (
    <>
      <Hero slides={content?.heroSlides ?? []} />
      <FeaturedBanners banners={content?.featuredBanners ?? []} />
      <BestsellersSection products={bestsellers} />
      <FoundersSection founders={content?.founders ?? []} />
      <WhyChooseUsSection items={content?.whyChooseUs ?? []} />
      <FaqSection items={content?.faq ?? []} />
      <NewsletterCta />
    </>
  );
}
