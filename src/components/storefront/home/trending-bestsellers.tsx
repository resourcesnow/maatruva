"use client";

import Link from "next/link";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { Reveal } from "@/components/motion/reveal";
import { CarouselArrow } from "@/components/storefront/home/carousel-arrow";
import { useSnapCarousel } from "@/hooks/use-snap-carousel";

const AUTO_ADVANCE_MS = 3500;

export type TrendingProductCard = {
  name: string;
  price: string;
  image: string;
  href: string;
};

export function TrendingBestsellers({
  title = "Trending Bestsellers",
  subtitle = "Our most loved rakhis, chosen by thousands of sisters.",
  products = [],
}: {
  title?: string;
  subtitle?: string;
  products?: TrendingProductCard[];
}) {
  const {
    containerRef,
    page,
    pageCount,
    canScrollPrev,
    scrollPrev,
    scrollNext,
    scrollToPage,
    pauseHandlers,
  } = useSnapCarousel({ itemCount: products.length, autoAdvanceMs: AUTO_ADVANCE_MS });

  if (products.length === 0) return null;

  return (
    <section className="bg-porcelain w-full pt-8 pb-6 md:pt-12 md:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-8 lg:flex-row lg:items-center lg:gap-12">
        <Reveal className="flex shrink-0 flex-col items-center gap-4 text-center lg:w-[30%] lg:items-start lg:justify-center lg:text-left">
          <h2 className="text-maroon font-serif text-3xl font-semibold md:text-5xl">{title}</h2>
          <p className="text-maroon/70 font-sans text-base font-light md:text-lg">{subtitle}</p>
          <Link
            href="/shop"
            className="border-gold text-gold hover:bg-gold hover:text-cream-light rounded-full border bg-transparent px-6 py-2.5 font-sans text-sm font-medium transition-colors duration-300"
          >
            View All
          </Link>
        </Reveal>

        <div className="flex min-w-0 items-center gap-1 sm:gap-3 lg:w-[70%]">
          {pageCount > 1 && (
            <CarouselArrow
              direction="prev"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              label="Previous product"
            />
          )}

          {/* Arrow slots are flex siblings, not overlays, so they never sit over the images. */}
          <Reveal
            delay={0.08}
            ref={containerRef}
            className="flex min-w-0 flex-1 snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth lg:gap-6 [&::-webkit-scrollbar]:hidden"
            {...pauseHandlers}
          >
            {products.map((product) => (
              <Link
                key={product.name}
                href={product.href}
                className="group bg-cream-light shadow-warm hover:shadow-warm-lg block w-[44%] shrink-0 snap-start overflow-hidden rounded-2xl transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.97] min-[480px]:w-[30%] md:w-[23%] lg:w-[calc((100%-3rem)/3)]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 480px) 45vw, (max-width: 767px) 29vw, (max-width: 1023px) 22vw, 23vw"
                    className="object-cover"
                    draggable={false}
                  />
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <span className="text-maroon truncate font-sans text-sm font-medium md:text-base">
                    {product.name}
                  </span>
                  <span className="text-maroon font-sans text-sm">{product.price}</span>
                </div>
              </Link>
            ))}
          </Reveal>

          {pageCount > 1 && (
            <CarouselArrow direction="next" onClick={scrollNext} label="Next product" />
          )}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 md:mt-10">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === page}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === page ? "bg-gold w-6" : "bg-cream-dark hover:bg-gold/50 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
