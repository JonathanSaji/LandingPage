"use client";

import { motion, useReducedMotion } from "framer-motion";
import { marqueeTransition } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "left" | "right";
}

export function InfiniteMarquee({
  children,
  className,
  speed = 28,
  direction = "left",
}: InfiniteMarqueeProps) {
  const reduceMotion = useReducedMotion();
  const sign = direction === "left" ? -1 : 1;

  if (reduceMotion) {
    return <div className={cn("overflow-hidden", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-void to-transparent" />

      <motion.div
        className="flex w-max gap-8"
        animate={{ x: ["0%", `${sign * -50}%`] }}
        transition={marqueeTransition(speed)}
      >
        <div className="flex shrink-0 gap-8">{children}</div>
        <div className="flex shrink-0 gap-8" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
