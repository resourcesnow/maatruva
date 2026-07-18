"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { animate, motion, useMotionValue, type PanInfo } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { CarouselArrow } from "@/components/storefront/home/carousel-arrow";

export type Collection = {
  label: string;
  image: string;
  href: string;
};

const GAP_PX = 24;
const AUTO_ADVANCE_MS = 4000;
const SLIDE_TRANSITION = { type: "tween" as const, duration: 0.4, ease: "easeInOut" as const };

// Desktop/tablet show 3 collections at once, aligned and centered; mobile shows what fits
// cleanly (1-2). Either way the set rotates one item at a time, not a full page.
function cardsPerViewFor(width: number) {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 3;
}

export function Collections({ items }: { items: Collection[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const x = useMotionValue(0);
  const ITEM_COUNT = items.length;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    function measure() {
      setViewportWidth(el!.getBoundingClientRect().width);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const cardsPerView = Math.min(ITEM_COUNT || 1, cardsPerViewFor(viewportWidth));
  const cardWidth = viewportWidth
    ? (viewportWidth - GAP_PX * (cardsPerView - 1)) / cardsPerView
    : 0;
  const step = cardWidth + GAP_PX;

  // Continuous cycling: the set can only loop seamlessly if there's at least one item
  // beyond what's already visible on screen at once.
  const canLoop = ITEM_COUNT > cardsPerView;

  useEffect(() => {
    setIndex((i) => Math.min(i, ITEM_COUNT));
  }, [cardsPerView, ITEM_COUNT]);

  useEffect(() => {
    if (paused || !canLoop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      // Step one card at a time, past the last real card onto the cloned leading cards
      // appended below — the effect after this one then snaps invisibly back to index 0
      // once those clones are fully in view, so the rotation reads as continuous rather
      // than a hard cut back to the start.
      setIndex((i) => i + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, canLoop]);

  useEffect(() => {
    const isCloneStep = index === ITEM_COUNT;
    const controls = animate(x, -index * step, {
      ...SLIDE_TRANSITION,
      onComplete: () => {
        if (isCloneStep) {
          x.set(0);
          setIndex(0);
        }
      },
    });
    return () => controls.stop();
  }, [index, step, x, ITEM_COUNT]);

  const goPrev = useCallback(() => {
    setPaused(true);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setPaused(true);
    setIndex((i) => i + 1);
  }, []);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = step * 0.2;
      if (info.offset.x < -threshold && index < ITEM_COUNT) {
        setIndex((i) => i + 1);
      } else if (info.offset.x > threshold && index > 0) {
        setIndex((i) => i - 1);
      } else {
        animate(x, -index * step, SLIDE_TRANSITION);
      }
    },
    [step, index, ITEM_COUNT, x],
  );

  const displayItems = canLoop ? [...items, ...items.slice(0, cardsPerView)] : items;
  const activeDot = index % (ITEM_COUNT || 1);

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
          {canLoop && (
            <CarouselArrow
              direction="prev"
              onClick={goPrev}
              disabled={index === 0}
              label="Previous collection"
            />
          )}

          {/* viewportRef measures this element specifically because it carries no padding or
              margin of its own — measuring a padded ancestor instead would include that padding
              in the border-box width (Tailwind sets box-sizing: border-box), inflating the card
              width math and pushing the track past the real content area on one side. The arrow
              slots live outside this element as flex siblings so they never sit over the images. */}
          <Reveal
            delay={0.08}
            ref={viewportRef}
            className="min-w-0 flex-1 overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <motion.div
              className="flex cursor-grab active:cursor-grabbing"
              style={{ x, gap: GAP_PX }}
              drag={canLoop ? "x" : false}
              dragConstraints={{ left: -step * (ITEM_COUNT - 1), right: 0 }}
              dragElastic={0.15}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
            >
              {displayItems.map((item, i) => (
                <Link
                  key={i < ITEM_COUNT ? item.label : `clone-${item.label}`}
                  href={item.href}
                  className="group flex shrink-0 flex-col items-center gap-3"
                  style={{
                    width:
                      cardWidth ||
                      `calc((100% - ${GAP_PX * (cardsPerView - 1)}px) / ${cardsPerView})`,
                  }}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#FBF6EC] shadow-[0_4px_16px_rgba(122,31,43,0.06)] transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:shadow-[0_12px_32px_rgba(198,161,91,0.35)]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.label}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
            </motion.div>
          </Reveal>

          {canLoop && <CarouselArrow direction="next" onClick={goNext} label="Next collection" />}
        </div>
      </div>

      {canLoop && (
        <div className="mt-8 flex items-center justify-center gap-2 md:mt-10">
          {items.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to ${item.label}`}
              aria-current={i === activeDot}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeDot ? "w-6 bg-[#C6A15B]" : "w-2 bg-[#E4D3B8] hover:bg-[#D8C29E]"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
