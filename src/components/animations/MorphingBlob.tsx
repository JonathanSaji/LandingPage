"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MorphingBlobProps {
  className?: string;
  color?: string;
}

const blobPaths = [
  "M65,35 C85,10 115,15 125,40 C140,70 120,95 90,100 C55,105 30,80 35,55 C38,42 48,38 65,35 Z",
  "M70,30 C100,5 130,25 128,55 C125,90 95,105 65,98 C35,90 25,60 40,40 C50,28 58,32 70,30 Z",
  "M60,38 C80,8 120,20 130,48 C138,78 110,102 78,100 C45,98 28,72 38,50 C45,38 52,42 60,38 Z",
  "M68,32 C95,12 125,30 122,58 C118,88 88,108 62,95 C38,82 32,55 48,38 C55,30 62,34 68,32 Z",
];

export function MorphingBlob({
  className,
  color = "rgb(255 214 10)",
}: MorphingBlobProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className={cn("rounded-full opacity-40 blur-3xl", className)}
        style={{ background: color, width: 200, height: 200 }}
      />
    );
  }

  return (
    <motion.svg
      viewBox="0 0 160 120"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <filter id="blob-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
        </filter>
      </defs>
      <motion.path
        fill={color}
        fillOpacity={0.35}
        filter="url(#blob-blur)"
        animate={{ d: blobPaths }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}
