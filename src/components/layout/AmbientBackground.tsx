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
  const orbOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.4]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ opacity: reduceMotion ? 1 : orbOpacity }}
    >
      <div className="absolute inset-0 bg-void" />

      <motion.div
        className="absolute -left-[20%] top-[10%] h-[55vh] w-[55vh] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgb(123 92 255) 0%, transparent 70%)",
          y: reduceMotion ? 0 : orbY1,
        }}
      />
      <motion.div
        className="absolute -right-[15%] top-[30%] h-[45vh] w-[45vh] rounded-full opacity-20 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgb(46 232 212) 0%, transparent 70%)",
          y: reduceMotion ? 0 : orbY2,
        }}
      />
      <motion.div
        className="absolute bottom-[5%] left-[35%] h-[40vh] w-[40vh] rounded-full opacity-15 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgb(255 77 141) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="absolute inset-0 grain-overlay"
        animate={reduceMotion ? undefined : { opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgb(123 92 255 / 0.12), transparent 55%)",
        }}
      />
    </motion.div>
  );
}
