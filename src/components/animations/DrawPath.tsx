"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface DrawPathProps {
  className?: string;
  d: string;
  stroke?: string;
  strokeWidth?: number;
  duration?: number;
}

export function DrawPath({
  className,
  d,
  stroke = "rgb(255 214 10)",
  strokeWidth = 2,
  duration = 2,
}: DrawPathProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const reduceMotion = useReducedMotion();

  return (
    <svg ref={ref} className={cn("h-full w-full", className)} fill="none" aria-hidden>
      <motion.path
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }}
        animate={
          inView
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={{ duration: reduceMotion ? 0 : duration, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
