"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/products/ProductCard";
import { products } from "@/lib/design-system";

const brainSyncIndex = products.findIndex((p) => p.id === "brain-sync");

export function ProductsSection() {
  const ordered = [
    products[brainSyncIndex],
    ...products.filter((_, i) => i !== brainSyncIndex),
  ];

  return (
    <section
      id="products"
      className="relative py-[var(--spacing-section)]"
      aria-labelledby="products-heading"
    >
      <motion.div
        className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-l from-honey/12 to-transparent blur-[100px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-[var(--spacing-container)]">
        <SectionHeader
          label="Seven specialized worlds"
          title="Every app has a soul. Every soul connects."
          description="From wanderlust to wellness, memory to money — each SubSync app masters its domain, then shares what it learns with the whole constellation."
          className="mb-14 md:mb-18"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {ordered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              featured={product.id === "brain-sync"}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
