"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

const stats = [
  { value: "7", label: "Specialized apps" },
  { value: "1", label: "Neural sync layer" },
  { value: "∞", label: "Cross-app context" },
  { value: "0", label: "Siloed data" },
];

export function StatsBar() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative"
      aria-label="SubSync at a glance"
    >
      <div className="section-divider absolute inset-x-0 top-0" />
      <motion.div
        className="relative mx-auto max-w-[1400px] px-[var(--spacing-container)] py-10 md:py-12"
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="relative overflow-hidden rounded-2xl glass-panel px-6 py-8 specular-top md:px-10 md:py-10"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-honey/5 via-transparent to-honey/5"
            animate={
              reduceMotion ? undefined : { opacity: [0.4, 0.8, 0.4] }
            }
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <ul className="relative grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08}>
                <li className="relative text-center md:text-left">
                  <span className="text-4xl font-bold tracking-tight text-pearl md:text-5xl">
                    {stat.value}
                  </span>
                  <p className="mt-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-pearl-dim">
                    {stat.label}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </motion.div>
      </motion.div>
      <div className="section-divider absolute inset-x-0 bottom-0" />
    </section>
  );
}
