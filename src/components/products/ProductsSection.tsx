"use client";

import { useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { ProductCard } from "./ProductCard";

// Colors from docs/brand/subsync_brand_guidelines_v2.html — Section 05
const PRODUCTS = [
  {
    id: 1,
    title: "TrackerSync",
    category: "Finance",
    description: "Your financial engine. Track every dollar, spot every pattern.",
    color: "#CCFF00",
    logoSrc: "/logos/TrackerSync.png",
  },
  {
    id: 2,
    title: "TravelSync",
    category: "Travel",
    description: "Every trip, perfectly synced. Itineraries, bookings, memories — one place.",
    color: "#F2994A",
    logoSrc: "/logos/TravelSync.png",
  },
  {
    id: 3,
    title: "BrainSync",
    category: "Focus",
    description: "Focus, amplified. Deep work sessions powered by your personal rhythm.",
    color: "#FFD700",
    logoSrc: "/logos/BrainSync.png",
  },
  {
    id: 4,
    title: "SeatSync",
    category: "Scheduling",
    description: "Book your desk, your shift, your day. Workplace time-slot scheduling, simplified.",
    color: "#39FF14",
    logoSrc: "/logos/SeatSync.png",
  },
  {
    id: 5,
    title: "PhotoSync",
    category: "Memory",
    description: "Memories, beautifully organized. Every photo in context.",
    color: "#A259FF",
    logoSrc: "/logos/PhotoSync.png",
  },
  {
    id: 6,
    title: "FluencySync",
    category: "Voice",
    description: "Your voice, perfected. Language learning that feels natural.",
    color: "#FF3C38",
    logoSrc: "/logos/FluencySync.png",
  },
  {
    id: 7,
    title: "SteadySync",
    category: "Access",
    description: "Stability at the core. One account, one subscription, all seven apps.",
    color: "#3A7B7B",
    logoSrc: "/logos/SteadySync.png",
  },
] as const;

const N = PRODUCTS.length;

function shortestPos(i: number, active: number): number {
  let pos = (i - active + N) % N;
  if (pos > N / 2) pos -= N;
  return pos;
}

export function ProductsSection() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  const goTo = useCallback((idx: number) => {
    setActive(((idx % N) + N) % N);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  goTo(active - 1);
      if (e.key === "ArrowRight") goTo(active + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, goTo]);

  // Touch / swipe
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) goTo(dx < 0 ? active + 1 : active - 1);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend",   onEnd);
    };
  }, [active, goTo]);

  return (
    <section
      id="apps"
      className="relative pt-24 pb-16"
      style={{ background: "#000" }}
      aria-labelledby="products-heading"
    >
      {/* Section header */}
      <div className="mx-auto max-w-[1400px] px-10 mb-4 text-center">
        <p
          className="text-[11px] font-medium tracking-[0.14em] uppercase mb-3"
          style={{ color: "#FFD700", fontFamily: "var(--font-dm-sans)" }}
        >
          The Sync Core Ecosystem
        </p>
        <h2
          id="products-heading"
          className="font-extrabold text-white"
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontFamily: "var(--font-poppins)",
            letterSpacing: "-0.02em",
          }}
        >
          Seven apps.{" "}
          <span style={{ color: "#FFD700" }}>One ecosystem.</span>
        </h2>
      </div>

      {/* 3D Carousel — overflow-x clips side cards; overflow-y visible so glow isn't cut */}
      <div className="relative" style={{ height: 460, overflowX: "clip", overflowY: "visible" }}>
        {/* Perspective container — no preserve-3d so z-index controls stacking */}
        <div
          className="absolute inset-0"
          style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
        >
          {/* Zero-size track at center — cards offset themselves from here */}
          <div className="absolute top-1/2 left-1/2">
            {PRODUCTS.map((product, i) => (
              <ProductCard
                key={product.id}
                title={product.title}
                category={product.category}
                description={product.description}
                color={product.color}
                logoSrc={product.logoSrc}
                pos={shortestPos(i, active)}
                reduceMotion={!!reduceMotion}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>

        {/* Prev arrow */}
        <button
          onClick={() => goTo(active - 1)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-50
                     w-11 h-11 rounded-full flex items-center justify-center text-white text-base
                     transition-[background,transform] duration-200
                     hover:scale-110 active:scale-95
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          aria-label="Previous app"
        >
          <span aria-hidden>←</span>
        </button>

        {/* Next arrow */}
        <button
          onClick={() => goTo(active + 1)}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-50
                     w-11 h-11 rounded-full flex items-center justify-center text-white text-base
                     transition-[background,transform] duration-200
                     hover:scale-110 active:scale-95
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          aria-label="Next app"
        >
          <span aria-hidden>→</span>
        </button>
      </div>

      {/* Dot pagination */}
      <div
        className="flex justify-center items-center gap-2 mt-10"
        role="tablist"
        aria-label="Select app"
      >
        {PRODUCTS.map((product, i) => (
          <button
            key={product.id}
            role="tab"
            aria-selected={i === active}
            aria-label={`Go to ${product.title}`}
            onClick={() => goTo(i)}
            className="h-[7px] rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            style={{
              width:      i === active ? 28 : 7,
              background: i === active ? "#FFD700" : "rgba(255,255,255,0.22)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
