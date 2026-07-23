"use client";

import { useEffect, useRef, useState } from "react";
import { Preloader } from "@/components/motion/preloader";

// This is a branded moment, not just a loading spinner — on a fast connection real hydration
// can complete in well under 100ms, which would cut the entrance choreography off before it's
// even visible. MIN_DISPLAY_MS guarantees it's seen at least once; real hydration readiness is
// still the ceiling, so a genuinely slow load is never held up any longer than it already is.
const MIN_DISPLAY_MS = 1500;

export function PreloaderGate({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  // Captured on the client's first render, i.e. the moment hydration for this subtree starts —
  // the baseline the floor is measured from.
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - mountedAt.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const timer = setTimeout(() => setIsLoading(false), remaining);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Preloader isLoading={isLoading} />
      {children}
    </>
  );
}
