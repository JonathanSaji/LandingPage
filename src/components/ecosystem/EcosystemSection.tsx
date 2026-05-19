"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { InteractiveEcosystemGraph } from "@/components/ecosystem/InteractiveEcosystemGraph";

const flowSteps = [
  {
    step: "01",
    title: "Capture",
    body: "Every app gathers context — trips, photos, notes, habits, spend, events — in its own language.",
  },
  {
    step: "02",
    title: "Pulse",
    body: "Signals stream into Sync Core in real time. No exports. No manual bridges. Just living data.",
  },
  {
    step: "03",
    title: "Compound",
    body: "BrainSync weaves insights across domains. Travel informs wellness. Photos enrich memory. Spend shapes goals.",
  },
  {
    step: "04",
    title: "Act",
    body: "Intelligence flows back to every app — smarter suggestions, richer context, one coherent you.",
  },
];

export function EcosystemSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="ecosystem"
      className="relative py-[var(--spacing-section)]"
      aria-labelledby="ecosystem-heading"
    >
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-honey/10 blur-[120px]"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.1, 1], opacity: [0.35, 0.65, 0.35] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-[var(--spacing-container)]">
        <SectionHeader
          label="The living constellation"
          title="One neural layer. Seven worlds."
          description="SubSync isn't a bundle of apps — it's an organism. Each product specializes; Sync Core connects them into intelligence that compounds."
          className="mb-16 md:mb-20"
        />

        <motion.div
          className="relative mb-16 overflow-hidden rounded-3xl glass-panel specular-top md:mb-20"
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-honey/12 via-transparent to-transparent"
            animate={
              reduceMotion ? undefined : { opacity: [0.35, 0.65, 0.35] }
            }
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgb(255_214_10/0.12),transparent_60%)]"
            aria-hidden
          />

          <motion.div
            className="relative flex flex-col items-center justify-center px-6 py-16 md:py-20"
            initial={reduceMotion ? false : { scale: 0.95 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <InteractiveEcosystemGraph />
          </motion.div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {flowSteps.map((item, i) => (
            <Reveal key={item.step} delay={i * 0.1}>
              <article className="group relative h-full rounded-2xl glass-card p-6 specular-top transition-colors hover:border-honey/20 md:p-8">
                <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-honey">
                  {item.step}
                </span>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-pearl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-pearl-muted md:text-base">
                  {item.body}
                </p>
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-honey/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100 md:left-8 md:right-8" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
