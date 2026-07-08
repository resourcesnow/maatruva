import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Price } from "../price";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export type FeaturedBanner = {
  image: string;
  title: string;
  mrp?: number;
  salePrice?: number;
  ctaLabel?: string;
  ctaHref: string;
};

export function FeaturedBanners({ banners }: { banners: FeaturedBanner[] }) {
  if (banners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {banners.map((banner) => (
          <RevealItem key={banner.title}>
            <Link
              href={banner.ctaHref}
              className="group bg-muted relative flex h-72 items-end overflow-hidden rounded-2xl md:h-96"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="relative z-10 flex w-full flex-col gap-2 p-6 text-white">
                <h3 className="font-heading text-2xl font-semibold">{banner.title}</h3>
                {banner.mrp != null && (
                  <Price price={banner.mrp} salePrice={banner.salePrice} size="md" light />
                )}
                <Button variant="secondary" size="sm" className="mt-2 w-fit">
                  {banner.ctaLabel ?? "Shop Now"}
                </Button>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
      <h2 className="font-heading text-3xl font-semibold md:text-4xl">{title}</h2>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}
