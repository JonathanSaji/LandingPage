"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { products } from "@/lib/design-system";

export function CTASection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative py-[var(--spacing-section)]"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-[1400px] px-[var(--spacing-container)]">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] glass-panel specular-top"
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="absolute -left-1/4 top-0 h-full w-1/2 rounded-full bg-honey/20 blur-[100px]"
            animate={
              reduceMotion
                ? undefined
                : { x: [0, 40, 0], opacity: [0.3, 0.55, 0.3] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <motion.div
            className="absolute -right-1/4 bottom-0 h-full w-1/2 rounded-full bg-honey-deep/15 blur-[100px]"
            animate={
              reduceMotion
                ? undefined
                : { x: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }
            }
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />

          <div className="absolute inset-0 grain-overlay" aria-hidden />

          <div className="relative px-8 py-16 text-center md:px-16 md:py-24">
            <motion.div
              className="mx-auto mb-8 flex flex-wrap justify-center gap-2"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {products.map((product) => (
                <span
                  key={product.id}
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: product.accent,
                    boxShadow: `0 0 8px rgb(${product.accentRgb} / 0.7)`,
                  }}
                  aria-hidden
                />
              ))}
            </motion.div>

            <h2
              id="cta-heading"
              className="text-section-title mx-auto max-w-3xl font-bold tracking-tight text-pearl"
            >
              Ready to leave the{" "}
              <span className="text-gradient-honey">app folder</span> behind?
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-lg text-pearl-muted">
              Join the waitlist for early access to the full SubSync ecosystem.
              Seven apps. One sync. Your life, finally connected.
            </p>

            <motion.div
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>
              <input
                id="cta-email"
                type="email"
                placeholder="you@universe.com"
                className="flex-1 rounded-full glass-pill px-5 py-3.5 text-pearl placeholder:text-pearl-dim transition-colors focus:border-honey/40 focus:outline-none focus:ring-2 focus:ring-honey/30"
              />
              <Button className="shrink-0 px-8 py-3.5">Join waitlist</Button>
            </motion.div>

            <p className="mt-6 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-pearl-dim">
              No spam · Early access perks · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
