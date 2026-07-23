"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

// Entrance timings match the original design export exactly (Maatruva Design project,
// "Maatruva Preloader.dc.html"): mandala fade+scale in, threads settle in from top/bottom
// with a trailing swing, wordmark halves slide in from left/right. The mandala's scale pulse
// loops for as long as the preloader is mounted. Transform-driven motion (x/y/scale/rotate)
// is automatically dropped under prefers-reduced-motion via the root layout's
// <MotionConfig reducedMotion="user">, leaving only the opacity crossfades.
export function Preloader({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          role="status"
          aria-live="polite"
          className="bg-porcelain fixed inset-0 z-100 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="sr-only">Loading…</span>
          <div aria-hidden="true" className="relative aspect-530/499 w-[min(80vw,460px)]">
            <motion.div
              className="absolute inset-0"
              style={{ transformOrigin: "54.7% 35.7%" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                opacity: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
                scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformOrigin: "54.7% 35.7%" }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
              >
                <Image
                  src="/preloader/mandala.png"
                  alt=""
                  fill
                  priority
                  sizes="460px"
                  draggable={false}
                  className="select-none"
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, x: "9%", y: "-142%", rotate: -7 }}
              animate={{
                opacity: [0, 1, 1],
                x: ["9%", "4%", "0%"],
                y: ["-142%", "-32%", "0%"],
                rotate: [-7, -3, 0],
              }}
              transition={{
                duration: 0.72,
                delay: 0.15,
                times: [0, 0.55, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformOrigin: "37.7% 31%" }}
                animate={{ rotate: [0, -2.6, 1.2, -0.4, 0] }}
                transition={{
                  duration: 0.8,
                  delay: 0.82,
                  times: [0, 0.28, 0.58, 0.82, 1],
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                <Image
                  src="/preloader/thread_top.png"
                  alt=""
                  fill
                  priority
                  sizes="460px"
                  draggable={false}
                  className="select-none"
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, x: "-7%", y: "142%", rotate: 7 }}
              animate={{
                opacity: [0, 1, 1],
                x: ["-7%", "-3%", "0%"],
                y: ["142%", "30%", "0%"],
                rotate: [7, 3, 0],
              }}
              transition={{
                duration: 0.72,
                delay: 0.15,
                times: [0, 0.55, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformOrigin: "82% 50%" }}
                animate={{ rotate: [0, 2.6, -1.2, 0.4, 0] }}
                transition={{
                  duration: 0.8,
                  delay: 0.82,
                  times: [0, 0.28, 0.58, 0.82, 1],
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                <Image
                  src="/preloader/thread_bottom.png"
                  alt=""
                  fill
                  priority
                  sizes="460px"
                  draggable={false}
                  className="select-none"
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, x: "-62%" }}
              animate={{ opacity: 1, x: "0%" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/preloader/ma.png"
                alt=""
                fill
                priority
                sizes="460px"
                draggable={false}
                className="select-none"
              />
            </motion.div>

            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, x: "62%" }}
              animate={{ opacity: 1, x: "0%" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/preloader/truva.png"
                alt=""
                fill
                priority
                sizes="460px"
                draggable={false}
                className="select-none"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
