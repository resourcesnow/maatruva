"use client";

import { useEffect, useRef } from "react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type BrandStatementFounder = {
  name: string;
  role?: string;
  photo?: string;
  message?: string;
};

export function BrandStatement({
  image,
  words,
  founders,
}: {
  image: string;
  words: string[];
  founders: BrandStatementFounder[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // One-time reveal as the section scrolls into view — no pin, no scrub,
      // so the section is a normal, permanently-visible part of the page.
      gsap.fromTo(
        [imageWrapRef.current, textRef.current],
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );

      const mm = gsap.matchMedia();

      mm.add("(min-width: 640px)", () => {
        const section = sectionRef.current;
        const cluster = clusterRef.current;
        if (!section || !cluster) return;

        // Cursor-driven parallax: each word rests at its own corner and is
        // pulled toward the center image the closer the cursor gets to the
        // section's center, easing back out to rest on mouseleave.
        // Directions are measured once, before any transform is applied, so
        // the live x/y offset from quickTo never feeds back into them.
        const MAX_PULL = 32;
        const clusterRectAtRest = cluster.getBoundingClientRect();
        const centerX = clusterRectAtRest.left + clusterRectAtRest.width / 2;
        const centerY = clusterRectAtRest.top + clusterRectAtRest.height / 2;

        const wordStates = wordRefs.current.map((word) => {
          if (!word) return null;
          const rect = word.getBoundingClientRect();
          const dx = centerX - (rect.left + rect.width / 2);
          const dy = centerY - (rect.top + rect.height / 2);
          const len = Math.hypot(dx, dy) || 1;
          return {
            dirX: dx / len,
            dirY: dy / len,
            setX: gsap.quickTo(word, "x", { duration: 0.6, ease: "power3.out" }),
            setY: gsap.quickTo(word, "y", { duration: 0.6, ease: "power3.out" }),
          };
        });

        function handlePointerMove(e: MouseEvent) {
          const sectionRect = section!.getBoundingClientRect();
          const px = (e.clientX - sectionRect.left) / sectionRect.width;
          const py = (e.clientY - sectionRect.top) / sectionRect.height;
          const dist = Math.hypot(px - 0.5, py - 0.5);
          const proximity = gsap.utils.clamp(0, 1, 1 - dist / 0.707);

          wordStates.forEach((word) => {
            if (!word) return;
            word.setX(word.dirX * MAX_PULL * proximity);
            word.setY(word.dirY * MAX_PULL * proximity);
          });
        }

        function handlePointerLeave() {
          wordStates.forEach((word) => {
            word?.setX(0);
            word?.setY(0);
          });
        }

        section.addEventListener("mousemove", handlePointerMove);
        section.addEventListener("mouseleave", handlePointerLeave);

        return () => {
          section.removeEventListener("mousemove", handlePointerMove);
          section.removeEventListener("mouseleave", handlePointerLeave);
        };
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!image || founders.length === 0) return null;

  return (
    <section ref={sectionRef} className="bg-cream w-full pt-4 pb-20 md:pt-6 md:pb-28">
      <h2 className="text-maroon px-4 text-center font-serif text-3xl font-semibold sm:px-8 md:text-5xl">
        Our Message
      </h2>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center gap-12 px-4 sm:mt-12 sm:px-8 md:mt-16">
        {/* Words layered over the image, sm and up. */}
        <div
          ref={clusterRef}
          className="relative hidden w-full max-w-5xl items-center justify-center sm:flex"
          style={{ minHeight: "min(58vh, 560px)" }}
        >
          <span
            ref={(el) => {
              wordRefs.current[0] = el;
            }}
            className="text-maroon/50 absolute top-[8%] left-[2%] z-20 font-serif text-5xl md:text-7xl"
          >
            {words[0]}
          </span>
          <span
            ref={(el) => {
              wordRefs.current[1] = el;
            }}
            className="text-gold/70 absolute top-[46%] right-0 z-20 font-serif text-5xl md:text-7xl"
          >
            {words[1]}
          </span>
          <span
            ref={(el) => {
              wordRefs.current[2] = el;
            }}
            className="text-maroon/50 absolute bottom-[6%] left-[8%] z-20 font-serif text-5xl md:text-7xl"
          >
            {words[2]}
          </span>

          <div
            ref={imageWrapRef}
            className="bg-cream relative z-10 aspect-900/1100 h-[58vh] max-h-140"
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* Mobile: simple stack. */}
        <div className="flex w-full flex-col items-center gap-4 sm:hidden">
          <span className="text-maroon/50 font-serif text-4xl">{words[0]}</span>
          <div className="bg-cream relative aspect-900/1100 w-56">
            <Image src={image} alt="" fill sizes="224px" className="object-contain" />
          </div>
          <span className="text-gold/70 font-serif text-4xl">{words[1]}</span>
          <span className="text-maroon/50 font-serif text-4xl">{words[2]}</span>
        </div>

        <div ref={textRef} className="flex w-full flex-col items-center gap-10">
          <div className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-6">
            {founders.map((founder, i) => {
              const isRight = i === 1;
              return (
                <div
                  key={founder.name}
                  className={`flex flex-col gap-3 ${isRight ? "items-end text-right" : "items-start text-left"}`}
                >
                  <div className="shadow-warm relative size-14 shrink-0 overflow-hidden rounded-full">
                    {founder.photo && (
                      <Image
                        src={founder.photo}
                        alt={founder.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className={`flex flex-col gap-1 ${isRight ? "items-end" : "items-start"}`}>
                    <p className="text-maroon font-sans text-sm font-semibold md:text-base">
                      {founder.name}
                    </p>
                    <p className="text-maroon/60 font-sans text-xs md:text-sm">{founder.role}</p>
                    <p className="text-maroon/80 mt-1 font-sans text-sm md:text-base">
                      {founder.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
