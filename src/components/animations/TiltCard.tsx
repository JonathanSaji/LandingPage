"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}

export function TiltCard({
  children,
  className,
  maxTilt = 14,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRX = useSpring(rotateX, { stiffness: 200, damping: 22 });
  const springRY = useSpring(rotateY, { stiffness: 200, damping: 22 });
  const glareX = useTransform(springRY, [-maxTilt, maxTilt], ["0%", "100%"]);
  const glareY = useTransform(springRX, [-maxTilt, maxTilt], ["0%", "100%"]);

  function onMove(e: React.MouseEvent) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * maxTilt * 2);
    rotateX.set((0.5 - py) * maxTilt * 2);
  }

  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  if (reduceMotion) {
    return <div className={cn("rounded-2xl glass-card", className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative rounded-2xl glass-card specular-top", className)}
      style={{
        rotateX: springRX,
        rotateY: springRY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgb(255 214 10 / 0.2), transparent 55%)`,
          }}
          aria-hidden
        />
      )}
      <div style={{ transform: "translateZ(24px)" }}>{children}</div>
    </motion.div>
  );
}
