"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { ProductCard } from "./ProductCard";

const PRODUCTS = [
  {
    id: 1,
    title: "TrackerSync",
    category: "Finance",
    description: "Your financial engine. Track every dollar, spot every pattern.",
    color: "#FFD700",
    LogoIcon: TrendingUp,
  },
  {
    id: 2,
    title: "TravelSync",
    category: "Travel",
    description: "Every trip, perfectly synced. Itineraries, bookings, memories — one place.",
    color: "#F2994A",
    logoSrc: "/logos/TravelSync.avif",
  },
  {
    id: 3,
    title: "BrainSync",
    category: "Focus",
    description: "Focus, amplified. Deep work sessions powered by your personal rhythm.",
    color: "#FFD700",
    logoSrc: "/logos/BrainSync.avif",
  },
  {
    id: 4,
    title: "SeatSync",
    category: "Scheduling",
    description:
      "Book your desk, your shift, your day. Workplace time-slot scheduling, simplified.",
    color: "#39FF14",
    logoSrc: "/logos/SeatSync.avif",
  },
  {
    id: 5,
    title: "PhotoSync",
    category: "Memory",
    description: "Memories, beautifully organized. Every photo in context.",
    color: "#A259FF",
    logoSrc: "/logos/PhotoSync.avif",
  },
  {
    id: 6,
    title: "FluencySync",
    category: "Voice",
    description: "Your voice, perfected. Language learning that feels natural.",
    color: "#FF3C38",
    logoSrc: "/logos/Fluency.avif",
  },
  {
    id: 7,
    title: "SteadySync",
    category: "Access",
    description:
      "Stability at the core. One account, one subscription, all seven apps.",
    color: "#3A7B7B",
    logoSrc: "/logos/SteadySync.avif",
  },
] as const;

const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export function ProductsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const fadeUpProps = reduceMotion ? {} : FADE_UP;

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  }

  return (
    <section
      id="apps"
      className="relative py-24 overflow-hidden"
      style={{ background: "#000" }}
      aria-labelledby="products-heading"
    >
      {/* Section header */}
      <div className="mx-auto max-w-[1400px] px-10 mb-10 text-center">
        <motion.p
          className="font-body font-medium text-[11px] tracking-[0.14em] uppercase mb-3"
          style={{ color: "#FFD700" }}
          {...fadeUpProps}
        >
          The Sync Core Ecosystem
        </motion.p>
        <motion.h2
          id="products-heading"
          className="font-heading font-bold text-white tracking-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          {...fadeUpProps}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Seven apps.{" "}
          <span style={{ color: "#FFD700" }}>One ecosystem.</span>
        </motion.h2>
      </div>

      {/* Scroll carousel */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
          aria-label="Scroll left"
        >
          <span aria-hidden="true">←</span>
        </button>

        {/* Cards row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-10 pt-6 pb-6"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {PRODUCTS.map((product, i) => (
            <div key={product.id} style={{ scrollSnapAlign: "start" }}>
              <ProductCard {...product} index={i} />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
          aria-label="Scroll right"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
