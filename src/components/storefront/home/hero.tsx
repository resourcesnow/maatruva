"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  image?: string;
  video?: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  // h-90-dvh (defined in globals.css) prefers 90dvh with a 90vh fallback — dvh tracks the
  // real visible viewport so mobile browsers' collapsing address bar can't cut off or
  // overflow the hero on first paint, the way a plain vh value would.
  return (
    <section className="bg-foreground h-90-dvh relative w-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {slide.image && (
            <Image
              src={slide.image}
              alt={slide.heading || "Hero image"}
              fill
              priority={index === 0}
              sizes="100vw"
              quality={90}
              className="h-full w-full object-cover object-center"
            />
          )}
          {/* A flat, uniform scrim (rather than a bottom-weighted gradient) so centered text
              keeps consistent contrast no matter where it lands on the underlying photo. */}
          <div className="absolute inset-0 bg-black/35" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-start justify-center gap-4 px-4 sm:px-8">
        <motion.div
          key={`content-${index}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex max-w-lg flex-col gap-4 text-white"
        >
          {slide.heading && (
            <h1 className="font-heading text-4xl leading-tight font-semibold md:text-6xl">
              {slide.heading}
            </h1>
          )}
          {slide.subheading && (
            <p className="text-base text-white/90 md:text-lg">{slide.subheading}</p>
          )}
          {slide.ctaHref && (
            <Button size="lg" className="w-fit" render={<Link href={slide.ctaHref} />}>
              {slide.ctaLabel ?? "Shop Now"}
            </Button>
          )}
        </motion.div>
      </div>

      {slides.length > 1 && (
        <>
          {/* The hero is deliberately full-bleed (no side gutters, per the earlier "no gray
              bands" requirement), so unlike the product carousels there's no off-image gutter
              to place these in — they stay overlaid, just without a circular backing shape. */}
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="hover:text-gold focus-visible:text-gold absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-md p-2 text-white transition-colors focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none md:left-4"
          >
            <ChevronLeft
              className="size-7 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
              strokeWidth={2.5}
            />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            aria-label="Next slide"
            className="hover:text-gold focus-visible:text-gold absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-md p-2 text-white transition-colors focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none md:right-4"
          >
            <ChevronRight
              className="size-7 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
              strokeWidth={2.5}
            />
          </button>
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
