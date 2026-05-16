"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressProps {
  className?: string;
  color?: string;
}

export function ScrollProgress({
  className,
  color = "rgb(255 214 10)",
}: ScrollProgressProps) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  if (reduceMotion) return null;

  return (
    <motion.div
      className={className}
      style={{
        scaleX,
        transformOrigin: "left",
        background: `linear-gradient(90deg, ${color}, rgb(255 229 102))`,
      }}
      aria-hidden
    />
  );
}
