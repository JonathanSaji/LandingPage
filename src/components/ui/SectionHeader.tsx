"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  const reduceMotion = useReducedMotion();
  const centered = align === "center";

  return (
    <motion.header
      className={cn(
        "max-w-3xl",
        centered && "mx-auto text-center",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <p
        className={cn(
          "mb-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-honey",
          centered && "justify-center",
        )}
      >
        {label}
      </p>
      <h2 className="text-section-title font-bold tracking-tight text-pearl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed text-pearl-muted md:text-xl",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </motion.header>
  );
}
