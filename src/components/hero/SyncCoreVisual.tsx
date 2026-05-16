"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useMemo, useRef } from "react";
import { AppLogo } from "@/components/brand/AppLogo";
import { products } from "@/lib/design-system";

const ORBIT_RADIUS = 148;
const NODE_SIZE = 12;

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  };
}

export function SyncCoreVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const visualY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const visualScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);
  const visualRotate = useTransform(scrollYProgress, [0, 1], [0, 8]);

  const nodes = useMemo(
    () =>
      products.map((product, index) => {
        const angle = (360 / products.length) * index - 90;
        const { x, y } = polarToCartesian(angle, ORBIT_RADIUS);
        return { product, x, y, angle };
      }),
    [],
  );

  return (
    <motion.div
      ref={containerRef}
      className="relative mx-auto aspect-square w-full max-w-[min(92vw,480px)]"
      style={{
        y: reduceMotion ? 0 : visualY,
        scale: reduceMotion ? 1 : visualScale,
        rotate: reduceMotion ? 0 : visualRotate,
      }}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`${-ORBIT_RADIUS - 40} ${-ORBIT_RADIUS - 40} ${(ORBIT_RADIUS + 40) * 2} ${(ORBIT_RADIUS + 40) * 2}`}
        fill="none"
      >
        <defs>
          <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(255 235 150)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(255 214 10)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {nodes.map(({ product, x, y }, index) => (
          <motion.line
            key={`line-${product.id}`}
            x1={0}
            y1={0}
            x2={x}
            y2={y}
            stroke={`rgb(${product.accentRgb} / 0.35)`}
            strokeWidth="1"
            strokeDasharray="4 6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: 0.6 + index * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}

        <motion.circle
          cx={0}
          cy={0}
          r={ORBIT_RADIUS}
          stroke="rgba(255, 214, 10, 0.12)"
          strokeWidth="1"
          fill="none"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "0px 0px" }}
        />
        <motion.circle
          cx={0}
          cy={0}
          r={ORBIT_RADIUS * 0.65}
          stroke="rgba(255, 229, 102, 0.2)"
          strokeWidth="1"
          strokeDasharray="2 8"
          fill="none"
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "0px 0px" }}
        />
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="relative flex h-28 w-28 items-center justify-center rounded-full md:h-32 md:w-32"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-honey/35 blur-2xl"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.15, 1], opacity: [0.4, 0.75, 0.4] }
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-full glass-card"
            animate={
              reduceMotion
                ? undefined
                : {
                    boxShadow: [
                      "0 0 40px rgb(255 214 10 / 0.35)",
                      "0 0 80px rgb(255 229 102 / 0.55)",
                      "0 0 40px rgb(255 214 10 / 0.35)",
                    ],
                  }
            }
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10 flex flex-col items-center gap-1">
            <AppLogo size="lg" glow animate priority />
            <span className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.28em] text-pearl-dim">
              Sync Core
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute left-1/2 top-1/2 h-0 w-0"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        {nodes.map(({ product, x, y }, index) => (
          <motion.div
            key={product.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.8 + index * 0.07,
              type: "spring",
              stiffness: 200,
              damping: 18,
            }}
          >
            <motion.button
              type="button"
              className="group relative flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey/50"
              style={{
                width: NODE_SIZE * 2,
                height: NODE_SIZE * 2,
              }}
              whileHover={{ scale: 1.2 }}
              aria-label={product.name}
            >
              <motion.span
                className="absolute inset-0 rounded-full opacity-0 blur-md transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: product.accent }}
              />
              <span
                className="relative block rounded-full border border-honey/40"
                style={{
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  backgroundColor: product.accent,
                  boxShadow: `0 0 20px rgb(${product.accentRgb} / 0.7)`,
                }}
              />
              <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full glass-pill px-2.5 py-1 text-[10px] font-medium text-pearl opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {product.name}
              </span>
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 mask-fade-radial bg-gradient-to-b from-transparent via-honey/5 to-transparent" />
    </motion.div>
  );
}
