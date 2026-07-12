"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { animate, motion, useMotionValue, type PanInfo } from "framer-motion";

function getCardsPerView(width: number) {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

const AUTO_ADVANCE_MS = 3500;
const SLIDE_TRANSITION = { type: "tween" as const, duration: 0.4, ease: "easeInOut" as const };

export type TrendingProductCard = {
  name: string;
  price: string;
  image: string;
  href: string;
};

export function TrendingBestsellers({
  title = "Trending Bestsellers",
  subtitle = "Our most loved rakhis, chosen by thousands of sisters.",
  products = [],
}: {
  title?: string;
  subtitle?: string;
  products?: TrendingProductCard[];
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const x = useMotionValue(0);
  const PRODUCT_COUNT = products.length;

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    function measure() {
      setViewportWidth(el!.getBoundingClientRect().width);
      setCardsPerView(getCardsPerView(window.innerWidth));
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

  const canLoop = PRODUCT_COUNT > cardsPerView;
  const cardWidth = cardsPerView > 0 ? viewportWidth / cardsPerView : 0;
  const pageCount = Math.max(1, Math.ceil(PRODUCT_COUNT / cardsPerView));
  const activeDot = Math.min(Math.floor(index / cardsPerView), pageCount - 1);

  useEffect(() => {
    setIndex((i) => Math.min(i, PRODUCT_COUNT));
  }, [cardsPerView, PRODUCT_COUNT]);

  useEffect(() => {
    if (paused || !canLoop) return;
    const id = setInterval(() => {
      // Step past the last real card onto the cloned leading cards so the
      // slide keeps moving forward; the animation effect below then snaps
      // invisibly back to index 0 once those clones are in view.
      setIndex((i) => i + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, canLoop]);

  useEffect(() => {
    const isCloneStep = index === PRODUCT_COUNT;
    const controls = animate(x, -index * cardWidth, {
      ...SLIDE_TRANSITION,
      onComplete: () => {
        if (isCloneStep) {
          x.set(0);
          setIndex(0);
        }
      },
    });
    return () => controls.stop();
  }, [index, cardWidth, x, PRODUCT_COUNT]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = cardWidth * 0.2;
      if (info.offset.x < -threshold && index < PRODUCT_COUNT) {
        setIndex((i) => i + 1);
      } else if (info.offset.x > threshold && index > 0) {
        setIndex((i) => i - 1);
      } else {
        animate(x, -index * cardWidth, SLIDE_TRANSITION);
      }
    },
    [cardWidth, index, x, PRODUCT_COUNT],
  );

  const items = canLoop ? [...products, ...products.slice(0, cardsPerView)] : products;

  if (products.length === 0) return null;

  return (
    <section className="bg-porcelain w-full pt-8 pb-6 md:pt-12 md:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex shrink-0 flex-col items-start gap-4 lg:w-[30%] lg:justify-center">
          <h2 className="text-maroon font-serif text-3xl font-semibold md:text-5xl">{title}</h2>
          <p className="text-maroon/70 font-sans text-base font-light md:text-lg">{subtitle}</p>
          <Link
            href="/shop"
            className="border-gold text-gold hover:bg-gold hover:text-cream-light rounded-full border bg-transparent px-6 py-2.5 font-sans text-sm font-medium transition-colors duration-300"
          >
            View All
          </Link>
        </div>

        <div
          ref={viewportRef}
          className="min-w-0 overflow-hidden lg:w-[70%]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <motion.div
            className="flex cursor-grab active:cursor-grabbing"
            style={{ x }}
            drag={canLoop ? "x" : false}
            dragConstraints={{ left: -cardWidth * (PRODUCT_COUNT - 1), right: 0 }}
            dragElastic={0.15}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            {items.map((product, i) => (
              <div
                key={i < PRODUCT_COUNT ? product.name : `clone-${product.name}`}
                className="shrink-0 px-2 sm:px-3"
                style={{ width: `${100 / cardsPerView}%` }}
              >
                <Link
                  href={product.href}
                  className="group bg-cream-light shadow-warm hover:shadow-warm-lg block overflow-hidden rounded-2xl transition-all duration-300 ease-out hover:scale-[1.03]"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 23vw, (min-width: 640px) 35vw, 90vw"
                      className="object-cover"
                      draggable={false}
                    />
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <span className="text-maroon truncate font-sans text-sm font-medium md:text-base">
                      {product.name}
                    </span>
                    <span className="text-maroon font-sans text-sm">{product.price}</span>
                  </div>
                </Link>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 md:mt-10">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i * cardsPerView)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === activeDot}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeDot ? "bg-gold w-6" : "bg-cream-dark hover:bg-gold/50 w-2"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
