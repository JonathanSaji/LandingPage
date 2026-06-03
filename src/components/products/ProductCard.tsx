"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface ProductCardProps {
  title: string;
  category: string;
  description: string;
  color: string;
  logoSrc: string;
  pos: number;          // position relative to active: 0=center, ±1, ±2
  reduceMotion: boolean;
  onClick: () => void;
}

// Per-position layout — tuned to match the Aura 3D carousel feel
const POS_CONFIG = [
  { x:   0, rotY:  0, scl: 1.00, opa: 1.00, z: 20 }, // center
  { x: 268, rotY: 36, scl: 0.80, opa: 0.82, z: 18 }, // ±1
  { x: 490, rotY: 52, scl: 0.62, opa: 0.54, z: 16 }, // ±2
] as const;

export function ProductCard({
  title,
  category,
  description,
  color,
  logoSrc,
  pos,
  reduceMotion,
  onClick,
}: ProductCardProps) {
  const abs  = Math.abs(pos);
  const sign = pos >= 0 ? 1 : -1;

  if (abs > 2) return null;

  const cfg = POS_CONFIG[abs];

  const animTarget = reduceMotion
    ? {}
    : {
        x:       cfg.x * sign,
        rotateY: cfg.rotY * sign,
        scale:   cfg.scl,
        opacity: cfg.opa,
      };

  return (
    <motion.article
      className="group absolute cursor-pointer"
      style={{
        width:  580,
        height: 370,
        top:   -185,
        left:  -290,
        zIndex:  cfg.z,
        willChange: "transform, opacity",
      }}
      initial={false}
      animate={animTarget}
      whileHover={reduceMotion ? undefined : {
        scale: cfg.scl * 1.06,
        y: -10,
        transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
      }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      aria-label={`Explore ${title}`}
    >
      {/* Card face — inner div handles hover expand without touching Framer's transform */}
      <div className="relative w-full h-full overflow-hidden rounded-[18px] border border-white/[0.06]">
        {/* Base mesh gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              `radial-gradient(ellipse 100% 80% at 20% 30%, ${color}22 0%, transparent 55%)`,
              `radial-gradient(ellipse 60% 60% at 80% 75%, ${color}12 0%, transparent 50%)`,
              "#0A0A0A",
            ].join(", "),
          }}
          aria-hidden
        />

        {/* Hover colour amplifier — stronger gradient, fades in on hover */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: [
              `radial-gradient(ellipse 130% 110% at 25% 35%, ${color}55 0%, transparent 55%)`,
              `radial-gradient(ellipse 80% 70% at 78% 72%, ${color}30 0%, transparent 50%)`,
            ].join(", "),
          }}
          aria-hidden
        />

        {/* Hover brand-colour border overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ border: `1px solid ${color}55` }}
          aria-hidden
        />

        {/* Category pill — top right */}
        <span
          className="absolute top-3.5 right-3.5 z-10 text-[9px] font-semibold tracking-[0.14em] uppercase px-2.5 py-1 rounded-full backdrop-blur-md"
          style={{
            color,
            background: `${color}18`,
            border:     `1px solid ${color}28`,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {category}
        </span>

        {/* Bottom bar — logo and text in one flex row so they stay aligned */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 flex items-end gap-3 px-4 pb-4 pt-16"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)" }}
        >
          <div
            className="flex-shrink-0 w-9 h-9 rounded-[11px] overflow-hidden bg-black"
            style={{ boxShadow: `0 4px 18px ${color}60` }}
          >
            <Image
              src={logoSrc}
              alt={`${title} logo`}
              width={36}
              height={36}
              className="object-contain w-full h-full"
            />
          </div>

          <div>
            <h3
              className="text-[17px] font-extrabold text-white tracking-[-0.02em] mb-0.5 leading-snug"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {title}
            </h3>
            <p
              className="text-[11.5px] leading-[1.45]"
              style={{ color: "rgba(255,255,255,0.48)", fontFamily: "var(--font-dm-sans)" }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Hover glow ring — brand colour, fades in */}
      <div
        className="pointer-events-none absolute inset-[-1px] rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `0 0 0 1.5px ${color}70, 0 0 70px ${color}40, 0 20px 50px ${color}20` }}
        aria-hidden
      />

      {/* Active (center) glow */}
      <div
        className="pointer-events-none absolute inset-[-1px] rounded-[18px] transition-opacity duration-500"
        style={{
          boxShadow: `0 0 0 1px ${color}50, 0 0 60px ${color}25`,
          opacity: pos === 0 ? 1 : 0,
        }}
        aria-hidden
      />
    </motion.article>
  );
}
