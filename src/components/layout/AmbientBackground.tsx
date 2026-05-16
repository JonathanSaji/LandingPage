"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.35]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ opacity: reduceMotion ? 1 : orbOpacity }}
    >
      <motion.div className="absolute inset-0 bg-void" />

      <motion.div
        className="absolute -left-[20%] top-[8%] h-[55vh] w-[55vh] rounded-full opacity-30 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgb(255 214 10) 0%, transparent 68%)",
          y: reduceMotion ? 0 : orbY1,
        }}
      />
      <motion.div
        className="absolute -right-[15%] top-[28%] h-[45vh] w-[45vh] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgb(255 229 102) 0%, transparent 70%)",
          y: reduceMotion ? 0 : orbY2,
        }}
      />
      <motion.div
        className="absolute bottom-[8%] left-[30%] h-[35vh] w-[35vh] rounded-full opacity-15 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgb(230 184 0) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="absolute inset-0 grain-overlay"
        animate={reduceMotion ? undefined : { opacity: [0.025, 0.045, 0.025] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -8%, rgb(255 214 10 / 0.14), transparent 58%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,214,10,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,214,10,0.4) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
        aria-hidden
      />

      <div
        className="absolute inset-x-0 top-0 h-[45vh] bg-gradient-to-b from-honey/[0.08] to-transparent"
        aria-hidden
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-void via-void/80 to-transparent"
        aria-hidden
      />
    </motion.div>
  );
}
