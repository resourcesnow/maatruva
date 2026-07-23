"use client";

import { useEffect, useState } from "react";
import { Preloader } from "@/components/motion/preloader";

// isLoading starts true so the server-rendered HTML and the client's first hydration pass
// agree (no mismatch). The effect below only runs once hydration has actually completed —
// not a fixed timeout — so the preloader's exit is tied to genuine page readiness. Pages in
// this app fetch their data server-side (Server Components), so hydration completing is
// already the point real content is interactive; there's no further client-side fetch to
// wait for.
export function PreloaderGate({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <Preloader isLoading={isLoading} />
      {children}
    </>
  );
}
