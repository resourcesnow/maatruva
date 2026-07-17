"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUiStore } from "@/store/ui";

// Mounted once at the root layout so it governs scroll site-wide (storefront + admin).
export function SmoothScrollProvider() {
  const lenisRef = useRef<Lenis | null>(null);
  const cartOpen = useUiStore((s) => s.cartOpen);
  const mobileMenuOpen = useUiStore((s) => s.mobileMenuOpen);
  const quickViewOpen = useUiStore((s) => s.quickViewSlug !== null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Operates on window/native scroll (no content-wrapping transform), so
    // position: sticky, in-page anchor jumps, and keyboard/screen-reader
    // scrolling all keep working exactly as they do without Lenis.
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Leave touch devices on native scroll — Lenis's touch smoothing tends to
      // feel laggy/wrong compared to the platform's own momentum scrolling.
      syncTouch: false,
    });
    lenisRef.current = lenis;

    gsap.registerPlugin(ScrollTrigger);
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis off its own rAF loop rather than gsap.ticker: routes that never
    // otherwise touch gsap (e.g. admin, which has no ScrollTrigger usage) can end up
    // on a separately-chunked gsap module instance in production, silently detaching
    // Lenis from the ticker it registered against. An independent rAF loop has no such
    // dependency, and ScrollTrigger still stays in sync via the "scroll" listener above.
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Lenis's built-in autoResize watches document.documentElement's own box size, which
    // never changes on this site (it's pinned to 100% viewport height via the `h-full`
    // class) — so it never notices content growing, e.g. when a Suspense `loading.tsx`
    // skeleton is replaced by full-height streamed-in content. Without this, Lenis keeps
    // its stale zero-scroll-height reading from the skeleton forever. Re-measure whenever
    // the DOM actually changes instead.
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const mutationObserver = new MutationObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => lenis.resize(), 100);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(resizeTimeout);
      mutationObserver.disconnect();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const overlayOpen = cartOpen || mobileMenuOpen || quickViewOpen;
    if (overlayOpen) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [cartOpen, mobileMenuOpen, quickViewOpen]);

  return null;
}
