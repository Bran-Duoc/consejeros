// ============================================================
// Framer Motion Transition Presets
// Centralized animation config for consistent UX
// ============================================================

import type { Variants, Transition } from "framer-motion";

// ---- Transition Presets ----
export const transitions = {
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 24,
  },
  springBouncy: {
    type: "spring",
    stiffness: 500,
    damping: 15,
  },
  springStiff: {
    type: "spring",
    stiffness: 700,
    damping: 30,
  },
  smooth: {
    type: "tween",
    duration: 0.3,
    ease: "easeInOut",
  },
  snappy: {
    type: "tween",
    duration: 0.15,
    ease: [0.25, 0.1, 0.25, 1],
  },
} as const satisfies Record<string, Transition>;

// ---- Animation Variants ----
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

// ---- Stagger Container ----
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ---- Step Transition (slide between form steps) ----
export const stepSlide = (direction: number): Variants => ({
  enter: {
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  },
});

// ---- Micro-interaction presets ----
export const buttonTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: transitions.spring,
} as const;

export const cardHover = {
  whileHover: { scale: 1.01, y: -2 },
  transition: transitions.smooth,
} as const;
