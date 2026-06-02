"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "apps",        label: "Apps" },
  { id: "ecosystem",   label: "Ecosystem" },
  { id: "get-started", label: "Get Started" },
] as const;

export function SectionNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sectionEls = SECTIONS.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="relative z-10 flex justify-center bg-black py-4">
      <nav
        aria-label="Page sections"
        className="flex items-center gap-1 rounded-full px-2 py-2"
        style={{
          background: "rgba(18, 18, 18, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="relative rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              style={{ color: isActive ? "#FFD700" : "rgba(255,255,255,0.50)" }}
            >
              {isActive && (
                <motion.span
                  layoutId="section-nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(255, 214, 10, 0.12)" }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
