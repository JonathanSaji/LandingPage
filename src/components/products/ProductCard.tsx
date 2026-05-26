"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface ProductCardProps {
  title: string;
  category: string;
  description: string;
  color: string;
  logoSrc?: string;
  LogoIcon?: LucideIcon;
  index: number;
}

export function ProductCard({
  title,
  category,
  description,
  color,
  logoSrc,
  LogoIcon,
  index,
}: ProductCardProps) {
  return (
    <motion.article
      className="relative flex-shrink-0 w-[300px] rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderTop: `2px solid ${color}`,
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6 }}
    >
      {/* Logo area */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden">
        {/* Ambient glow behind logo */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 70%, ${color}22, transparent 70%)`,
          }}
          aria-hidden
        />

        {logoSrc ? (
          /* PNG logos — white app-icon container so gray backgrounds look intentional */
          <div
            className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden bg-white p-1.5 shadow-lg"
            style={{ boxShadow: `0 0 32px ${color}44` }}
          >
            <Image
              src={logoSrc}
              alt={`${title} logo`}
              fill
              className="object-contain"
            />
          </div>
        ) : LogoIcon ? (
          /* Icon fallback — colored glass container */
          <div
            className="relative z-10 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `${color}20`,
              border: `1px solid ${color}40`,
              boxShadow: `0 0 32px ${color}44`,
            }}
          >
            <LogoIcon className="w-12 h-12" style={{ color }} aria-hidden />
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="px-6 pb-6 pt-4">
        {/* Category badge */}
        <span
          className="inline-block font-body text-[10px] font-medium tracking-[0.12em] uppercase px-2.5 py-1 rounded-full mb-3"
          style={{
            color,
            background: `${color}18`,
            border: `1px solid ${color}30`,
          }}
        >
          {category}
        </span>

        <h3 className="font-heading font-bold text-xl text-white tracking-tight mb-2">
          {title}
        </h3>

        <p className="font-body font-light text-sm text-[#94A3B8] leading-relaxed">
          {description}
        </p>

        {/* Explore link — visible on hover only */}
        <div
          className="mt-5 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color }}
          aria-hidden
        >
          Explore <span aria-hidden>→</span>
        </div>
      </div>
    </motion.article>
  );
}
