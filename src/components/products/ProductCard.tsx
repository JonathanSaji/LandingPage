"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
  const exploreUrl = `https://${title.toLowerCase()}.sub-sync.ca`;

  return (
    <motion.article
      className="relative flex-shrink-0 w-[280px] rounded-2xl group"
      style={{
        background: "rgba(10,10,10,0.9)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -14, scale: 1.04, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }
      }
    >
      {/* Hover glow ring — CSS opacity transition only */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `0 0 0 1px ${color}80, 0 20px 60px ${color}50, 0 0 120px ${color}20` }}
        aria-hidden
      />

      <a
        href={exploreUrl}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
        aria-label={`Explore ${title}`}
      >
        {/* App preview area */}
        <div className="relative h-44 overflow-hidden rounded-t-2xl">
          {/* Accent gradient top stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] z-10"
            style={{ background: `linear-gradient(90deg, transparent 0%, ${color} 40%, transparent 100%)` }}
            aria-hidden
          />

          {/* Preview background — colored mesh gradient placeholder */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 90% 80% at 20% 30%, ${color}20 0%, transparent 55%), radial-gradient(ellipse 60% 60% at 80% 80%, ${color}10 0%, transparent 50%), rgba(10,10,10,1)`,
            }}
            aria-hidden
          />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
            aria-hidden
          />

          {/* Placeholder label */}
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="font-body text-[9px] tracking-[0.2em] uppercase text-white opacity-15">
              App Preview
            </span>
          </div>

          {/* Logo chip — bottom-left corner */}
          <div className="absolute bottom-3 left-3 z-10">
            {logoSrc ? (
              <div
                className="w-9 h-9 rounded-xl overflow-hidden bg-white"
                style={{ boxShadow: `0 4px 16px ${color}60` }}
              >
                <Image
                  src={logoSrc}
                  alt={`${title} logo`}
                  width={36}
                  height={36}
                  className="object-contain w-full h-full"
                />
              </div>
            ) : LogoIcon ? (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: `${color}20`,
                  border: `1px solid ${color}50`,
                  boxShadow: `0 4px 16px ${color}40`,
                }}
              >
                <LogoIcon className="w-4 h-4" style={{ color }} aria-hidden />
              </div>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 pt-4">
          <span
            className="inline-block font-body text-[10px] font-medium tracking-[0.14em] uppercase px-2.5 py-1 rounded-full mb-3"
            style={{
              color,
              background: `${color}12`,
              border: `1px solid ${color}25`,
            }}
          >
            {category}
          </span>

          <h3 className="font-heading font-semibold text-[16px] text-white tracking-tight mb-2 leading-snug">
            {title}
          </h3>

          <p className="font-body text-[13px] leading-relaxed" style={{ color: "#6E6E73" }}>
            {description}
          </p>

          {/* Explore — slides in on hover */}
          <div
            className="mt-4 flex items-center gap-1.5 text-[12px] font-medium opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            style={{ color }}
          >
            Explore <span aria-hidden>→</span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}
