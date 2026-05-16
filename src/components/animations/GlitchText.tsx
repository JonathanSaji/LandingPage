"use client";

import { motion, useReducedMotion } from "framer-motion";
import { glitchKeyframes } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface GlitchTextProps {
  children: string;
  className?: string;
  interval?: number;
}

export function GlitchText({ children, className, interval = 4 }: GlitchTextProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={cn("relative inline-block", className)}>
      <motion.span
        className="relative z-10"
        animate={glitchKeyframes}
        transition={{
          duration: 0.35,
          repeat: Infinity,
          repeatDelay: interval,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-honey opacity-70 mix-blend-screen"
        aria-hidden
        animate={{
          x: [0, 4, -3, 0],
          opacity: [0, 0.8, 0, 0],
        }}
        transition={{
          duration: 0.35,
          repeat: Infinity,
          repeatDelay: interval,
        }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-honey-deep opacity-50 mix-blend-multiply"
        aria-hidden
        animate={{
          x: [0, -4, 3, 0],
          opacity: [0, 0.6, 0, 0],
        }}
        transition={{
          duration: 0.35,
          repeat: Infinity,
          repeatDelay: interval,
          delay: 0.05,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
