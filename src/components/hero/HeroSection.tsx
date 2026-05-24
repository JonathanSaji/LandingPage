"use client";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Plane,
  Brain,
  Calendar,
  Camera,
  Mic,
  Shield,
} from "lucide-react";
import { HeroWave } from "./HeroWave";
import { RadialOrbitalTimeline } from "@/components/ui/radial-orbital-timeline";

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
    color: "#10B981",
    icon: TrendingUp,
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
    color: "#3B82F6",
    icon: Plane,
    date: "Travel",
    content:
      "Every trip, perfectly synced. Itineraries, bookings, memories — one place.",
    category: "Travel",
    relatedIds: [1, 5],
    status: "completed" as const,
    energy: 88,
  },
  {
    id: 3,
    title: "BrainSync",
    color: "#8B5CF6",
    icon: Brain,
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
    color: "#F59E0B",
    icon: Calendar,
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
    color: "#EC4899",
    icon: Camera,
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
    color: "#06B6D4",
    icon: Mic,
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
    color: "#FFD700",
    icon: Shield,
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
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Wave canvas — z-0 */}
      <HeroWave />

      {/* Left vignette — z-1 */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
        }}
      />

      {/* Navigation — z-10 */}
      <nav
        className="absolute top-0 left-0 right-0 z-10 h-16 flex items-center justify-between px-10 border-b border-white/[0.06]"
        style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="font-heading text-[22px] font-black text-[#FFD700] tracking-tight">
          SubSync
        </span>
        <div className="flex items-center gap-8">
          {["Apps", "Features", "Pricing"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="font-body text-sm text-[#94A3B8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
            >
              {link}
            </a>
          ))}
        </div>
        <button className="font-heading text-sm font-bold bg-[#FFD700] text-black px-5 py-2 rounded-lg hover:bg-[#ffe033] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-transform duration-150">
          Get Started
        </button>
      </nav>

      {/* Main grid — z-2 */}
      <div className="relative z-[2] min-h-screen pt-16 grid grid-cols-2">
        {/* Left: hero copy */}
        <div className="flex flex-col justify-center pl-20 pr-8 gap-6">
          <motion.p
            className="font-body text-[11px] font-medium text-[#FFD700] uppercase tracking-[0.14em]"
            {...fadeUp(0.15)}
          >
            The Sync Core Ecosystem
          </motion.p>

          <h1
            className="font-heading font-black leading-[0.95] tracking-[-0.03em] flex flex-col"
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
            className="font-body font-light text-[#94A3B8] text-[16px] leading-[1.75] max-w-[440px]"
            {...fadeUp(1.2)}
          >
            SubSync isn&apos;t another app — it&apos;s a connected universe
            where travel, memory, and focus pulse through one intelligent Sync
            Core.
          </motion.p>

          <motion.div className="flex items-center gap-3" {...fadeUp(1.5)}>
            <button className="font-heading text-sm font-bold bg-[#FFD700] text-black px-7 py-3 rounded-lg hover:bg-[#ffe033] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-transform duration-150">
              Get Started
            </button>
            <button className="font-body text-sm text-white px-7 py-3 rounded-lg border border-white/20 hover:bg-white/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-transform duration-150">
              Explore the Apps →
            </button>
          </motion.div>
        </div>

        {/* Right: orbital diagram */}
        <div className="relative flex items-center justify-center overflow-visible">
          <RadialOrbitalTimeline timelineData={APPS} />
        </div>
      </div>
    </section>
  );
}
