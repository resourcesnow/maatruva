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

    // Drive Lenis off GSAP's ticker (rather than its own rAF loop) so it and
    // ScrollTrigger-based animations (e.g. the homepage brand-statement
    // section) stay on the same frame clock and never drift apart.
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
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
