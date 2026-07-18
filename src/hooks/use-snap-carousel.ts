"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Drives a native CSS scroll-snap carousel (real browser momentum/touch scrolling, not a
// JS-simulated drag) while still exposing the bits a carousel UI needs: how many items are
// visible per "page", which page is active (for dots), and prev/next/goToPage controls.
//
// itemsPerView is measured from the DOM rather than duplicated from the Tailwind breakpoints
// that size each card — the card widths are the single source of truth, this just counts how
// many of them fit, so the two never drift out of sync.
export function useSnapCarousel({
  itemCount,
  autoAdvanceMs,
}: {
  itemCount: number;
  autoAdvanceMs?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  const measureStep = useCallback(() => {
    const container = containerRef.current;
    const first = container?.firstElementChild as HTMLElement | null | undefined;
    if (!container || !first) return 0;
    const gap = parseFloat(getComputedStyle(container).columnGap || "0");
    return first.getBoundingClientRect().width + gap;
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      const step = measureStep();
      if (step > 0) setItemsPerView(Math.max(1, Math.round(container!.clientWidth / step)));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measureStep]);

  const pageCount = Math.max(1, Math.ceil(itemCount / itemsPerView));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0;

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = measureStep();
        if (step <= 0) return;
        const index = Math.round(container!.scrollLeft / step);
        setPage(Math.floor(index / itemsPerView));
      });
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [itemsPerView, measureStep]);

  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    const target = container?.children[index] as HTMLElement | undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "start",
      block: "nearest",
    });
  }, []);

  const scrollToPage = useCallback(
    (targetPage: number) => {
      const clamped = Math.max(0, Math.min(pageCount - 1, targetPage));
      scrollToIndex(clamped * itemsPerView);
    },
    [pageCount, itemsPerView, scrollToIndex],
  );

  const scrollPrev = useCallback(() => scrollToPage(page - 1), [page, scrollToPage]);

  const scrollNext = useCallback(() => {
    if (page >= pageCount - 1) {
      scrollToIndex(0);
    } else {
      scrollToPage(page + 1);
    }
  }, [page, pageCount, scrollToPage, scrollToIndex]);

  useEffect(() => {
    if (!autoAdvanceMs || paused || pageCount <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(scrollNext, autoAdvanceMs);
    return () => clearInterval(id);
  }, [autoAdvanceMs, paused, pageCount, scrollNext]);

  return {
    containerRef,
    page,
    pageCount,
    canScrollPrev: page > 0,
    scrollPrev,
    scrollNext,
    scrollToPage,
    pauseHandlers: {
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false),
      onTouchStart: () => setPaused(true),
      onTouchEnd: () => setPaused(false),
    },
  };
}
