"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Plane } from "lucide-react";
import { ProductCard } from "./ProductCard";

const PRODUCTS = [
  {
    id: 1,
    title: "TrackerSync",
    category: "Finance",
    description: "Your financial engine. Track every dollar, spot every pattern.",
    color: "#10B981",
    LogoIcon: TrendingUp,
  },
  {
    id: 2,
    title: "TravelSync",
    category: "Travel",
    description:
      "Every trip, perfectly synced. Itineraries, bookings, memories — one place.",
    color: "#3B82F6",
    LogoIcon: Plane,
  },
  {
    id: 3,
    title: "BrainSync",
    category: "Focus",
    description:
      "Focus, amplified. Deep work sessions powered by your personal rhythm.",
    color: "#8B5CF6",
    logoSrc: "/logos/BrainSync.png",
  },
  {
    id: 4,
    title: "SeatSync",
    category: "Scheduling",
    description:
      "Book your desk, your shift, your day. Workplace time-slot scheduling, simplified.",
    color: "#F59E0B",
    logoSrc: "/logos/SeatSync.png",
  },
  {
    id: 5,
    title: "PhotoSync",
    category: "Memory",
    description: "Memories, beautifully organized. Every photo in context.",
    color: "#EC4899",
    logoSrc: "/logos/PhotoSync.png",
  },
  {
    id: 6,
    title: "FluencySync",
    category: "Voice",
    description: "Your voice, perfected. Language learning that feels natural.",
    color: "#06B6D4",
    logoSrc: "/logos/FluencySync.png",
  },
  {
    id: 7,
    title: "SteadySync",
    category: "Access",
    description:
      "Stability at the core. One account, one subscription, all seven apps.",
    color: "#FFD700",
    logoSrc: "/logos/SteadySync.png",
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
      left: dir === "left" ? -324 : 324,
      behavior: "smooth",
    });
  }

  return (
    <section
      id="apps"
      className="relative py-20 bg-black overflow-hidden"
      aria-labelledby="products-heading"
    >
      {/* Section header */}
      <div className="px-20 mb-10">
        <motion.p
          className="font-body font-medium text-[11px] tracking-[0.14em] uppercase text-[#FFD700] mb-3"
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
          <span className="text-[#FFD700]">One ecosystem.</span>
        </motion.h2>
      </div>

      {/* Scroll container + arrow buttons */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          aria-label="Scroll left"
        >
          <span aria-hidden="true">←</span>
        </button>

        {/* Cards row */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-20 pb-4"
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
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          aria-label="Scroll right"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
