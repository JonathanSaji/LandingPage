"use client";

import { useReducedMotion } from "framer-motion";

/** Returns static-friendly motion props when user prefers reduced motion. */
export function useMotionSafe<T extends Record<string, unknown>>(
  animated: T,
  staticFallback: Partial<T> = {},
): T {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? ({ ...animated, ...staticFallback } as T) : animated;
}

export function useMotionEnabled() {
  const reduceMotion = useReducedMotion();
  return !reduceMotion;
}
