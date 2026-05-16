"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

const features = [
  {
    icon: "pulse",
    title: "Real-time pulses",
    description:
      "Context flows between apps the moment it matters — no nightly syncs, no stale exports.",
    span: "lg:col-span-2",
  },
  {
    icon: "shield",
    title: "Privacy by architecture",
    description:
      "Your data stays yours. End-to-end encryption with granular controls per app and per connection.",
    span: "",
  },
  {
    icon: "brain",
    title: "Compound intelligence",
    description:
      "BrainSync learns from every domain. Insights get richer the more of the ecosystem you use.",
    span: "",
  },
  {
    icon: "device",
    title: "One identity",
    description:
      "Single sign-on across all seven apps. Preferences, themes, and settings travel with you.",
    span: "",
  },
  {
    icon: "mesh",
    title: "Mesh context",
    description:
      "Trip dates inform language lessons. Photos anchor memories in your second brain. Spend shapes wellness goals.",
    span: "lg:col-span-2",
  },
  {
    icon: "offline",
    title: "Works where you are",
    description:
      "Offline-first where it counts. Sync Core reconciles when you're back — seamlessly, silently.",
    span: "",
  },
];

function FeatureIcon({ type }: { type: string }) {
  const className = "h-5 w-5 text-honey";

  switch (type) {
    case "pulse":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 12h4l2-7 4 14 2-7h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "shield":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />
        </svg>
      );
    case "brain":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </svg>
      );
    case "device":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "mesh":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
          <path d="M12 7v4M8.5 16.5L10 14M15.5 16.5L14 14" />
        </svg>
      );
    case "offline":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3a9 9 0 109 9" strokeLinecap="round" />
          <path d="M12 7v5l3 2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function FeaturesSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      className="relative py-[var(--spacing-section)]"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-[1400px] px-[var(--spacing-container)]">
        <SectionHeader
          label="Platform capabilities"
          title="Built for connection, not collection."
          description="SubSync isn't a folder of apps — it's infrastructure for a life that stays in sync."
          align="center"
          className="mb-14 md:mb-20"
        />

        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.06} className={feature.span}>
              <article
                className={`group relative h-full overflow-hidden rounded-2xl glass-card p-6 specular-top transition-colors hover:border-honey/20 md:p-8 ${feature.span}`}
              >
                <motion.div
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-honey/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <motion.div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl glass-pill"
                  whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: 3 }}
                >
                  <FeatureIcon type={feature.icon} />
                </motion.div>
                <h3 className="text-xl font-bold tracking-tight text-pearl md:text-2xl">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-pearl-muted md:text-base">
                  {feature.description}
                </p>
              </article>
            </Reveal>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
