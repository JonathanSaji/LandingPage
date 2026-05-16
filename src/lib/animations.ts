/**
 * SubSync animation presets — import variants/transitions in any component.
 * All respect prefers-reduced-motion when used with our animation components.
 */

import type { Transition, Variants } from "framer-motion";

export const easings = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  outBack: [0.34, 1.56, 0.64, 1] as const,
  inOutCubic: [0.65, 0, 0.35, 1] as const,
  elastic: [0.68, -0.55, 0.265, 1.55] as const,
};

export const transitions = {
  snappy: { type: "spring", stiffness: 400, damping: 28 } satisfies Transition,
  smooth: { type: "spring", stiffness: 120, damping: 22 } satisfies Transition,
  cinematic: { duration: 1.1, ease: easings.outExpo } satisfies Transition,
  slow: { duration: 2.4, ease: easings.inOutCubic } satisfies Transition,
  pop: { type: "spring", stiffness: 260, damping: 18 } satisfies Transition,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easings.outExpo },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easings.outExpo },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.pop,
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: easings.outExpo },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: easings.outExpo },
  },
};

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -12, scale: 0.9 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: transitions.pop,
  },
};

export const flipIn: Variants = {
  hidden: { opacity: 0, rotateX: 90, y: 40 },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { duration: 0.9, ease: easings.outBack },
  },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(16px)", y: 24 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.85, ease: easings.outExpo },
  },
};

export const staggerContainer = (
  stagger = 0.08,
  delayChildren = 0.12,
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easings.outExpo },
  },
};

export const infiniteSpin = (duration = 20): Transition => ({
  duration,
  repeat: Infinity,
  ease: "linear",
});

export const floatY = (duration = 4): Transition => ({
  duration,
  repeat: Infinity,
  repeatType: "reverse",
  ease: "easeInOut",
});

export const pulseGlow = (duration = 3): Transition => ({
  duration,
  repeat: Infinity,
  repeatType: "reverse",
  ease: "easeInOut",
});

export const glitchKeyframes = {
  x: [0, -3, 4, -2, 0],
  opacity: [1, 0.85, 1, 0.9, 1],
  skewX: [0, -2, 3, -1, 0],
};

export const marqueeTransition = (duration = 25): Transition => ({
  duration,
  repeat: Infinity,
  ease: "linear",
});
