"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  amount?: number;
}

const offsets = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: {},
};

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  amount = 40,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const offset = offsets[direction];
  const axis = "x" in offset ? "x" : "y" in offset ? "y" : null;
  const value = axis ? (offset as { x?: number; y?: number })[axis] ?? amount : 0;

  const hidden: Variants["hidden"] =
    axis === "x"
      ? { opacity: 0, x: value }
      : axis === "y"
        ? { opacity: 0, y: value }
        : { opacity: 0 };

  if (reduceMotion) {
    return <motion.div className={className}>{children}</motion.div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={hidden}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
