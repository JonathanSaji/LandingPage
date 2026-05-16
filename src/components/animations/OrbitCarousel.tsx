"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbitItem {
  id: string;
  label: string;
  color?: string;
}

interface OrbitCarouselProps {
  items: OrbitItem[];
  radius?: number;
  duration?: number;
  className?: string;
}

export function OrbitCarousel({
  items,
  radius = 100,
  duration = 24,
  className,
}: OrbitCarouselProps) {
  const reduceMotion = useReducedMotion();
  const size = radius * 2 + 48;

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute rounded-full border border-honey/20 glass-pill"
        style={{ width: radius * 2, height: radius * 2 }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => {
          const angle = (360 / items.length) * i - 90;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          return (
            <motion.div
              key={item.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ x, y }}
              animate={reduceMotion ? undefined : { rotate: -360 }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full glass-pill text-[9px] font-medium text-pearl"
                style={{
                  boxShadow: item.color
                    ? `0 0 16px ${item.color}`
                    : "0 0 16px rgb(255 214 10 / 0.5)",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color ?? "#ffd60a" }}
                />
              </span>
              <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[9px] text-pearl-dim">
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
      <PulseRingsCore />
    </div>
  );
}

function PulseRingsCore() {
  return (
    <motion.div
      className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full glass-card text-xs font-bold text-honey"
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      Core
    </motion.div>
  );
}
