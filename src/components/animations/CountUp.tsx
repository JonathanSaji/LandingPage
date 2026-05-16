"use client";

import { motion, useInView, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CountUpProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
}

export function CountUp({
  value,
  suffix = "",
  prefix = "",
  className,
  duration = 1.8,
  decimals = 0,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const spring = useSpring(0, {
    stiffness: 80 / duration,
    damping: 20,
  });
  const display = useTransform(spring, (v) =>
    `${prefix}${v.toFixed(decimals)}${suffix}`,
  );

  useEffect(() => {
    if (reduceMotion) {
      spring.set(value);
      return;
    }
    if (inView) spring.set(value);
  }, [inView, value, spring, reduceMotion]);

  useEffect(() => {
    if (!reduceMotion && inView) {
      spring.set(0);
      const t = setTimeout(() => spring.set(value), 50);
      return () => clearTimeout(t);
    }
  }, [inView, value, spring, reduceMotion]);

  if (reduceMotion) {
    return (
      <span ref={ref} className={className}>
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </motion.span>
  );
}
