"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { animate, motion, useMotionValue, type PanInfo } from "framer-motion";

export type Collection = {
  label: string;
  image: string;
  href: string;
};

const CARDS_PER_VIEW = 3;
const AUTO_ADVANCE_MS = 4000;
const SLIDE_TRANSITION = { type: "tween" as const, duration: 0.4, ease: "easeInOut" as const };

export function Collections({ items }: { items: Collection[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const cardsPerView = CARDS_PER_VIEW;
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const x = useMotionValue(0);

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

  const pageCount = Math.max(1, Math.ceil(items.length / cardsPerView));

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount]);

  useEffect(() => {
    if (paused || pageCount <= 1) return;
    const id = setInterval(() => {
      // Advance past the last real page onto the cloned first page so the
      // slide keeps moving forward; the animation effect below then snaps
      // invisibly back to the real page 0 once that clone is in view.
      setPage((p) => p + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, pageCount]);

  useEffect(() => {
    const isCloneSlide = page === pageCount;
    const controls = animate(x, -page * viewportWidth, {
      ...SLIDE_TRANSITION,
      onComplete: () => {
        if (isCloneSlide) {
          x.set(0);
          setPage(0);
        }
      },
    });
    return () => controls.stop();
  }, [page, viewportWidth, pageCount, x]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = viewportWidth * 0.2;
      if (info.offset.x < -threshold && page < pageCount - 1) {
        setPage((p) => p + 1);
      } else if (info.offset.x > threshold && page > 0) {
        setPage((p) => p - 1);
      } else {
        animate(x, -page * viewportWidth, SLIDE_TRANSITION);
      }
    },
    [viewportWidth, page, pageCount, x],
  );

  const pages = Array.from({ length: pageCount }, (_, i) =>
    items.slice(i * cardsPerView, i * cardsPerView + cardsPerView),
  );
  // Append a clone of the first page so auto-advance can slide seamlessly
  // past the last page instead of snapping backwards to page 0.
  const slides = pageCount > 1 ? [...pages, pages[0]] : pages;
  const activeDot = page % pageCount;

  if (items.length === 0) return null;

  return (
    <section className="bg-porcelain w-full pt-16 pb-8 md:pt-24 md:pb-12">
      <h2 className="font-heading px-4 text-center text-3xl font-semibold text-[#7A1F2B] sm:px-8 md:text-5xl">
        Explore Our Collections
      </h2>

      <div
        ref={viewportRef}
        className="mx-auto mt-12 max-w-7xl overflow-hidden px-4 sm:px-8 md:mt-16"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          style={{ x }}
          drag={pageCount > 1 ? "x" : false}
          dragConstraints={{ left: -viewportWidth * (pageCount - 1), right: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {slides.map((group, slideIndex) => (
            <div
              key={slideIndex === pages.length ? "clone" : slideIndex}
              className="grid shrink-0 gap-4 sm:gap-6 md:gap-8"
              style={{
                width: viewportWidth || "100%",
                gridTemplateColumns: `repeat(${cardsPerView}, minmax(0, 1fr))`,
              }}
            >
              {group.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex flex-col items-center gap-3"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#FBF6EC] shadow-[0_4px_16px_rgba(122,31,43,0.06)] transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:shadow-[0_12px_32px_rgba(198,161,91,0.35)]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.label}
                        fill
                        sizes="33vw"
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
            </div>
          ))}
        </motion.div>
      </div>

      {pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 md:mt-10">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Go to page ${i + 1}`}
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
