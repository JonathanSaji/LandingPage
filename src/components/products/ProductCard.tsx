"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Product } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  index?: number;
}

export function ProductCard({ product, featured, index = 0 }: ProductCardProps) {
  const reduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);

  return (
    <motion.article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl glass-card p-6 specular-top transition-colors md:p-8",
        "hover:border-honey/25",
        featured && "md:col-span-2 md:row-span-2 md:p-10",
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.06,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      <motion.div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl transition-opacity group-hover:opacity-100 opacity-50"
        style={{ backgroundColor: `rgb(${product.accentRgb} / 0.3)` }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-xl glass-pill",
            featured ? "h-14 w-14" : "h-11 w-11",
          )}
          style={{
            boxShadow: `0 0 24px -6px rgb(${product.accentRgb} / 0.5)`,
          }}
        >
          {product.logo && !imageError ? (
            <Image
              src={product.logo}
              alt={product.name}
              width={featured ? 56 : 44}
              height={featured ? 56 : 44}
              className="h-full w-full object-contain p-1"
              priority
              onError={() => setImageError(true)}
            />
          ) : (
            <span
              className={cn("rounded-full", featured ? "h-4 w-4" : "h-3 w-3")}
              style={{
                backgroundColor: product.accent,
                boxShadow: `0 0 12px rgb(${product.accentRgb} / 0.8)`,
              }}
            />
          )}
        </div>
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-pearl-dim">
          App {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3
        className={cn(
          "relative mt-5 font-bold tracking-tight text-pearl",
          featured ? "text-3xl md:text-4xl" : "text-xl md:text-2xl",
        )}
      >
        {product.name}
      </h3>

      <p
        className={cn(
          "relative mt-2 font-medium",
          featured ? "text-lg md:text-xl" : "text-sm md:text-base",
        )}
        style={{ color: product.accent }}
      >
        {product.tagline}
      </p>

      <p
        className={cn(
          "relative mt-4 flex-1 leading-relaxed text-pearl-muted",
          featured ? "text-base md:text-lg" : "text-sm",
        )}
      >
        {product.personality}
      </p>

      <div className="relative mt-6 border-t border-white/[0.08] pt-5">
        <p className="text-xs leading-relaxed text-pearl-muted md:text-sm">
          <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em] text-honey/80">
            Syncs with ecosystem ·{" "}
          </span>
          {product.connection}
        </p>
      </div>

      <motion.button
        type="button"
        className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-pearl-muted transition-colors group-hover:text-honey"
        whileHover={{ x: 4 }}
      >
        Explore {product.name}
        <span aria-hidden>→</span>
      </motion.button>
    </motion.article>
  );
}
