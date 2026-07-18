import type { Variants } from "framer-motion";

// Shared easing + duration budget for every entrance/interaction animation in the app —
// kept inside the 200-300ms range and one consistent curve so motion feels like a single
// system rather than a pile of one-off tweaks. Travel distance is small (12px) on purpose:
// it reads clearly on mobile without feeling like a big layout jump on a small viewport.
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: EASE_OUT } },
};

// Capped at 60ms so a section with many siblings (e.g. a grid of feature cards) doesn't
// take noticeably long to finish revealing on scroll.
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE_OUT } },
};
