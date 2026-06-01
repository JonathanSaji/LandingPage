"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleUserRound } from "lucide-react";
import { HeroWave } from "./HeroWave";
import { RadialOrbitalTimeline } from "@/components/ui/radial-orbital-timeline";
import { AuthModal } from "@/components/auth/AuthModal";

const EASE = [0.16, 1, 0.3, 1] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  };
}

const APPS = [
  {
    id: 1,
    title: "TrackerSync",
    color: "#FFD700",
    logoSrc: "/logos/TrackerSync.png",
    date: "Finance",
    content: "Your financial engine. Track every dollar, spot every pattern.",
    category: "Finance",
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "TravelSync",
    color: "#F2994A",
    logoSrc: "/logos/TravelSync.png",
    date: "Travel",
    content:
      "Every trip, perfectly synced. Itineraries, bookings, memories - one place.",
    category: "Travel",
    relatedIds: [1, 5],
    status: "completed" as const,
    energy: 88,
  },
  {
    id: 3,
    title: "BrainSync",
    color: "#FFD700",
    logoSrc: "/logos/BrainSync.png",
    date: "Focus",
    content:
      "Focus, amplified. Deep work sessions powered by your personal rhythm.",
    category: "Focus",
    relatedIds: [1, 4],
    status: "in-progress" as const,
    energy: 72,
  },
  {
    id: 4,
    title: "SeatSync",
    color: "#39FF14",
    logoSrc: "/logos/SeatSync.png",
    date: "Scheduling",
    content:
      "Book your desk, your shift, your day. Workplace time-slot scheduling, simplified.",
    category: "Scheduling",
    relatedIds: [3, 6],
    status: "in-progress" as const,
    energy: 65,
  },
  {
    id: 5,
    title: "PhotoSync",
    color: "#A259FF",
    logoSrc: "/logos/PhotoSync.png",
    date: "Memory",
    content: "Memories, beautifully organized. Every photo in context.",
    category: "Memory",
    relatedIds: [2, 7],
    status: "completed" as const,
    energy: 91,
  },
  {
    id: 6,
    title: "FluencySync",
    color: "#FF3C38",
    logoSrc: "/logos/FluencySync.png",
    date: "Voice",
    content: "Your voice, perfected. Language learning that feels natural.",
    category: "Voice",
    relatedIds: [4, 7],
    status: "in-progress" as const,
    energy: 58,
  },
  {
    id: 7,
    title: "SteadySync",
    color: "#3A7B7B",
    logoSrc: "/logos/SteadySync.png",
    date: "Access",
    content:
      "Stability at the core. One account, one subscription, all seven apps.",
    category: "Access",
    relatedIds: [5, 6],
    status: "completed" as const,
    energy: 100,
  },
];

export function HeroSection() {
  const [authOpen, setAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handler = () => setAuthOpen(true);
    window.addEventListener("subsync:openAuth", handler);
    return () => window.removeEventListener("subsync:openAuth", handler);
  }, []);

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-black">
        {/* Wave canvas - z-0 */}
        <HeroWave />

        {/* Left vignette - z-1 */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
          }}
        />

        {/* Navigation - z-10 */}
        <nav
          className="absolute left-0 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-white/[0.06] px-10"
          style={{
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="font-heading text-[22px] font-black tracking-tight text-[#FFD700]">
            SubSync
          </span>
          <div className="flex items-center gap-8">
            {["Apps", "Features", "Pricing"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="rounded font-body text-sm text-[#94A3B8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => {}}
                aria-label="Open profile"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <CircleUserRound size={20} />
              </button>
            )}

            <button
              onClick={() => {
                if (isLoggedIn) {
                  setIsLoggedIn(false);
                  setAuthOpen(false);
                  return;
                }

                setAuthOpen((prev) => !prev);
              }}
              className="font-heading rounded-lg bg-[#FFD700] px-5 py-2 text-sm font-bold text-black transition-transform duration-150 hover:bg-[#ffe033] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {isLoggedIn ? "Logout" : authOpen ? "Back to Orbital" : "Sign In"}
            </button>
          </div>
        </nav>

        {/* Main grid - z-2 */}
        <div className="relative z-[2] grid min-h-screen grid-cols-2 pt-16">
          {/* Left: hero copy */}
          <div className="flex flex-col justify-center gap-6 pl-20 pr-8">
            <motion.p
              className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700]"
              {...fadeUp(0.15)}
            >
              The Sync Core Ecosystem
            </motion.p>

            <h1
              className="flex flex-col font-heading font-extrabold leading-[0.95] tracking-[-0.03em]"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
            >
              <motion.span className="text-white" {...fadeUp(0.4)}>
                Seven apps. Onesync.
              </motion.span>
              <motion.span className="text-[#FFD700]" {...fadeUp(0.6)}>
                Infinite possibility.
              </motion.span>
            </h1>

            <motion.p
              className="max-w-[440px] font-body text-[16px] font-light leading-[1.75] text-[#94A3B8]"
              {...fadeUp(1.2)}
            >
              SubSync isn&apos;t another app - it&apos;s a connected universe where
              travel, memory, and focus pulse through one intelligent Sync Core.
            </motion.p>

            <motion.div className="flex items-center gap-3" {...fadeUp(1.5)}>
              <button
                onClick={() => setAuthOpen((prev) => !prev)}
                className="font-heading rounded-lg bg-[#FFD700] px-7 py-3 text-sm font-bold text-black transition-transform duration-150 hover:bg-[#ffe033] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {authOpen ? "Back to Orbital" : "Get Started"}
              </button>
              <button className="font-body rounded-lg border border-white/20 px-7 py-3 text-sm text-white transition-transform duration-150 hover:bg-white/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                Explore the Apps -&gt;
              </button>
            </motion.div>
          </div>

          {/* Right: orbital/login swap */}
          <div className="relative flex min-h-[640px] items-center justify-center overflow-visible">
            <AnimatePresence mode="wait" initial={false}>
              {!authOpen ? (
                <motion.div
                  key="orbital"
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <RadialOrbitalTimeline timelineData={APPS} />
                </motion.div>
              ) : (
                <motion.div
                  key="auth-inline"
                  className="absolute inset-0 flex items-center justify-center px-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <AuthModal
                    variant="inline"
                    onClose={() => setAuthOpen(false)}
                    onAuthSuccess={() => setIsLoggedIn(true)}
                    className="w-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom fade — blends wave canvas into ProductsSection black */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3]"
          style={{
            height: "80px",
            background: "linear-gradient(to bottom, transparent, #000000)",
          }}
          aria-hidden
        />
      </section>
    </>
  );
}
