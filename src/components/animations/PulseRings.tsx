"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PulseRingsProps {
  className?: string;
  count?: number;
  color?: string;
  size?: number;
}

export function PulseRings({
  className,
  count = 4,
  color = "rgb(255 214 10)",
  size = 120,
}: PulseRingsProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className={cn("rounded-full border border-honey/30", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: `color-mix(in srgb, ${color} ${40 - i * 8}%, transparent)` }}
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeOut",
          }}
        />
      ))}
      <span
        className="absolute inset-[35%] rounded-full bg-honey/80"
        style={{ boxShadow: `0 0 24px ${color}` }}
      />
    </div>
  );
}
