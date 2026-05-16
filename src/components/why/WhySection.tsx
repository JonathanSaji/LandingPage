"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

const contrasts = [
  {
    old: "Seven logins. Seven silos. Zero context.",
    next: "One ecosystem. Shared intelligence. Infinite compound returns.",
  },
  {
    old: "Copy-paste between apps like it's 2010.",
    next: "Live pulses through Sync Core — automatic, invisible, instant.",
  },
  {
    old: "Productivity tools that compete for attention.",
    next: "Specialized apps that collaborate for your life.",
  },
];

const pillars = [
  {
    stat: "10×",
    label: "Richer context",
    detail: "When travel, memory, and wellness share a neural layer.",
  },
  {
    stat: "0",
    label: "Manual bridges",
    detail: "No Zapier chains. No export rituals. Just sync.",
  },
  {
    stat: "7→1",
    label: "Unified you",
    detail: "Seven specialists, one coherent intelligence.",
  },
];

export function WhySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="why"
      className="relative py-[var(--spacing-section)]"
      aria-labelledby="why-heading"
    >
      <motion.div
        className="pointer-events-none absolute left-0 bottom-0 h-[50vh] w-[50vw] rounded-full bg-gradient-to-tr from-honey/10 to-transparent blur-[100px]"
        aria-hidden
      />

      <motion.div
        className="pointer-events-none absolute right-0 top-0 h-[40vh] w-[40vw] rounded-full bg-gradient-to-bl from-honey-deep/10 to-transparent blur-[80px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-[var(--spacing-container)]">
        <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeader
              label="Why SubSync"
              title="The app folder is dead."
              description="You don't need another tool. You need a constellation — specialized apps that actually talk to each other, powered by intelligence that compounds with every interaction."
            />

            <ul className="mt-12 space-y-4">
              {contrasts.map((item, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <li className="rounded-2xl glass-card p-5 specular-top md:p-6">
                    <p className="text-sm text-pearl-dim line-through decoration-pearl-dim/40 md:text-base">
                      {item.old}
                    </p>
                    <p className="mt-2 text-base font-medium text-pearl md:text-lg">
                      {item.next}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="relative">
            <motion.div
              className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-honey/20 via-transparent to-honey-deep/10 blur-2xl"
              animate={
                reduceMotion ? undefined : { opacity: [0.35, 0.65, 0.35] }
              }
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />

            <div className="relative rounded-3xl glass-panel p-8 specular-top md:p-10">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-honey">
                The SubSync difference
              </p>

              <blockquote className="mt-6 text-2xl font-bold leading-snug tracking-tight text-pearl md:text-3xl">
                &ldquo;We didn&apos;t build seven apps. We built one organism with seven
                specialized organs.&rdquo;
              </blockquote>

              <p className="mt-4 text-sm text-pearl-dim">
                — SubSync founding principle
              </p>

              <ul className="mt-10 grid gap-4 sm:grid-cols-3">
                {pillars.map((pillar, i) => (
                  <Reveal key={pillar.label} delay={0.2 + i * 0.08}>
                    <li className="rounded-xl glass-pill p-4 text-center sm:text-left">
                      <span className="text-3xl font-bold text-honey md:text-4xl">
                        {pillar.stat}
                      </span>
                      <p className="mt-1 text-sm font-medium text-pearl">
                        {pillar.label}
                      </p>
                      <p className="mt-1 text-xs text-pearl-dim">{pillar.detail}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
