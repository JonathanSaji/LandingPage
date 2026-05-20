"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { AppLogo } from "@/components/brand/AppLogo";
import { Button } from "@/components/ui/Button";
import { SyncCoreVisual } from "@/components/hero/SyncCoreVisual";
import { products } from "@/lib/design-system";

const headlineWords = ["Seven", "apps.", "One", "sync.", "Infinite", "possibility."];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 48, rotateX: -40 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.35], [0, -80]);
  const scrollCueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-dvh overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-[1400px] px-[var(--spacing-container)]">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 xl:gap-12">
          <motion.div
            style={
              reduceMotion
                ? undefined
                : { opacity: contentOpacity, y: contentY }
            }
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-3 rounded-full glass-pill py-1.5 pl-1.5 pr-4"
            >
              <AppLogo size="sm" glow />
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-pearl-muted">
                Ecosystem launch · 7 products live
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="text-hero-display font-[family-name:var(--font-display)] font-bold text-pearl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ perspective: 1200 }}
            >
              {headlineWords.map((word, i) => (
                <span key={word + i} className="mr-[0.2em] inline-block overflow-hidden">
                  <motion.span
                    variants={wordVariants}
                    className={
                      i === 2 || i === 3
                        ? "text-gradient-honey"
                        : undefined
                    }
                  >
                    {word}
                  </motion.span>
                  {(i === 1 || i === 3) && <br className="hidden sm:block" />}
                </span>
              ))}
            </motion.h1>

            <motion.p
              className="mt-6 max-w-xl text-lg leading-relaxed text-pearl-muted md:text-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              SubSync isn&apos;t another app — it&apos;s a connected universe where
              travel, memory, mind, language, wellness, money, and live experiences
              pulse through one intelligent{" "}
              <span className="font-medium text-honey">Sync Core</span>.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Button className="group px-8 py-3.5 text-base">
                Enter the ecosystem
                <motion.span
                  className="inline-block"
                  animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
              <Button variant="secondary" className="px-8 py-3.5 text-base">
                Watch the film
              </Button>
            </motion.div>

            <motion.ul
              className="mt-12 flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95, duration: 0.8 }}
              aria-label="SubSync products"
            >
              {products.map((product) => (
                <li key={product.id}>
                  <motion.div
                    className="inline-flex items-center gap-1.5 rounded-full glass-pill px-2 py-1 text-xs text-pearl-muted transition-colors hover:border-honey/25 hover:text-pearl"
                    whileHover={{ scale: 1.05 }}
                  >
                    {product.logo && (
                      <Image
                        src={product.logo}
                        alt={product.name}
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    )}
                    <span>{product.name}</span>
                  </motion.div>
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            className="relative lg:pl-4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-honey/15 via-transparent to-transparent blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]">
              <AppLogo size="hero" />
            </div>
            <div className="relative rounded-[2rem] glass-panel p-4 specular-top md:p-6">
              <SyncCoreVisual />
            </div>
            <motion.p
              className="mt-6 text-center font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-pearl-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              All seven apps · One neural layer
            </motion.p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ opacity: reduceMotion ? 1 : scrollCueOpacity }}
        aria-hidden
      >
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-pearl-dim">
          Scroll to explore
        </span>
        <motion.div
          className="flex h-10 w-6 items-start justify-center rounded-full glass-pill p-1.5"
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span className="h-2 w-1 rounded-full bg-honey" />
        </motion.div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-void to-transparent"
        aria-hidden
      />
    </section>
  );
}
