"use client";

import Link from "next/link";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { Reveal } from "@/components/motion/reveal";
import { CarouselArrow } from "@/components/storefront/home/carousel-arrow";
import { useSnapCarousel } from "@/hooks/use-snap-carousel";

export type Collection = {
  label: string;
  image: string;
  href: string;
};

const AUTO_ADVANCE_MS = 4000;

export function Collections({ items }: { items: Collection[] }) {
  const {
    containerRef,
    page,
    pageCount,
    canScrollPrev,
    scrollPrev,
    scrollNext,
    scrollToPage,
    pauseHandlers,
  } = useSnapCarousel({ itemCount: items.length, autoAdvanceMs: AUTO_ADVANCE_MS });

  if (items.length === 0) return null;

  return (
    <section className="bg-porcelain w-full pt-16 pb-8 md:pt-24 md:pb-12">
      <Reveal>
        <h2 className="font-heading px-4 text-center text-3xl font-semibold text-[#7A1F2B] sm:px-8 md:text-5xl">
          Explore Our Collections
        </h2>
      </Reveal>

      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-8 md:mt-16">
        <div className="flex items-center gap-1 sm:gap-3">
          {pageCount > 1 && (
            <CarouselArrow
              direction="prev"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              label="Previous collection"
            />
          )}

          {/* No padding/margin of its own — see the note in use-snap-carousel.ts on why
              clientWidth needs to be measured off an unpadded element. Native scroll-snap
              handles the actual scrolling; the hook only reads position, never drives it. */}
          <Reveal
            delay={0.08}
            ref={containerRef}
            className="flex min-w-0 flex-1 snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth lg:gap-6 [&::-webkit-scrollbar]:hidden"
            {...pauseHandlers}
          >
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex w-[44%] shrink-0 snap-start flex-col items-center gap-3 min-[480px]:w-[30%] md:w-[23%] lg:w-[calc((100%-3rem)/3)]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#FBF6EC] shadow-[0_4px_16px_rgba(122,31,43,0.06)] transition-transform duration-300 ease-out group-hover:scale-[1.03] group-active:scale-[0.97]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.label}
                      fill
                      sizes="(max-width: 480px) 45vw, (max-width: 767px) 29vw, (max-width: 1023px) 22vw, 33vw"
                      className="object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-3 text-center text-sm font-medium text-[#7A1F2B]/50">
                      {item.label}
                    </div>
                  )}
                </div>
                <span className="text-center text-sm font-medium text-[#7A1F2B] md:text-base">
                  {item.label}
                </span>
              </Link>
            ))}
          </Reveal>

          {pageCount > 1 && (
            <CarouselArrow direction="next" onClick={scrollNext} label="Next collection" />
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
                i === page ? "w-6 bg-[#C6A15B]" : "w-2 bg-[#E4D3B8] hover:bg-[#D8C29E]"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
