"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";

const MEMBERS = [
  {
    name: "Krishna",
    image: "/about/2026-06-07 EDIT SubSync Group Photo Krishna.jpg",
    bio: "Placeholder bio: Krishna helps shape SubSync ideas into clear product direction and keeps the team focused on what matters most.",
    stats: ["Role: Placeholder", "Focus: Product", "Apps Built: 00", "Years Coding: 0"],
  },
  {
    name: "Zayaan",
    image: "/about/2026-06-07 EDIT SubSync Group Photo ZAYAAN.jpg",
    bio: "Placeholder bio: Zayaan contributes to design and development, turning concepts into polished, usable experiences.",
    stats: ["Role: Placeholder", "Focus: Design", "Apps Built: 00", "Years Coding: 0"],
  },
  {
    name: "Jon",
    image: "/about/2026-06-07 EDIT SubSync Group Photo Jon.jpg",
    bio: "Placeholder bio: Jon supports implementation across the platform and helps the team deliver features with consistency.",
    stats: ["Role: Placeholder", "Focus: Build", "Apps Built: 00", "Years Coding: 0"],
  },
  {
    name: "Pascal",
    image: "/about/2026-06-07 EDIT SubSync Group Photo Pascal.jpg",
    bio: "Placeholder bio: Pascal focuses on quality and detail, helping refine the final product and overall user flow.",
    stats: ["Role: Placeholder", "Focus: QA", "Apps Built: 00", "Years Coding: 0"],
  },
] as const;

const GROUP = {
  name: "The SubSync Team",
  image: "/about/2026-06-07 EDIT SubSync Group Photo Group.jpg",
  bio: "Placeholder group bio: We are a team of four students building a connected ecosystem of apps under SubSync. Our goal is to create focused, practical tools that make day-to-day work smoother and more synchronized.",
  stats: ["Members: 4", "Apps in Ecosystem: 7", "School Team: Grade 11", "Mission: Build Better Tools"],
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handleChange = () => setIsMobile(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
}

function FramedImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-[340px] w-full sm:h-[430px] lg:h-[560px]">
      <div
        className="absolute -inset-2 rounded-[2rem]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,215,0,0.26) 0%, rgba(255,255,255,0.07) 55%, rgba(255,215,0,0.18) 100%)",
          filter: "blur(1px)",
        }}
        aria-hidden
      />

      <div
        className="absolute inset-0 rounded-[1.5rem] border"
        style={{
          borderColor: "rgba(255,255,255,0.18)",
          background:
            "radial-gradient(circle at 18% 12%, rgba(255,215,0,0.11), rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.8) 100%)",
          boxShadow: "0 24px 56px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={false}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.25) 100%)",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function StatBubbles({ stats }: { stats: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2.5 pt-2">
      {stats.map((stat) => (
        <span
          key={stat}
          className="rounded-full border px-3 py-1.5 font-body text-xs text-[#E4E4E7] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:text-white"
          style={{
            borderColor: "rgba(255,255,255,0.16)",
            background: "linear-gradient(130deg, rgba(255,255,255,0.1) 0%, rgba(255,215,0,0.1) 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {stat}
        </span>
      ))}
    </div>
  );
}

function AboutSection({
  title,
  bio,
  image,
  stats,
  index,
  desktopMotion,
  mobileMotion,
}: {
  title: string;
  bio: string;
  image: string;
  stats: readonly string[];
  index: number;
  desktopMotion: boolean;
  mobileMotion: boolean;
}) {
  const animateSection = desktopMotion || mobileMotion;

  return (
    <motion.section
      className="grid items-center gap-7 rounded-[2rem] border p-5 sm:p-8 lg:min-h-[610px] lg:grid-cols-2 lg:gap-14 lg:p-12"
      style={{
        borderColor: "rgba(255,255,255,0.1)",
        background:
          index % 2 === 0
            ? "linear-gradient(130deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 48%, rgba(255,215,0,0.04) 100%)"
            : "linear-gradient(130deg, rgba(255,255,255,0.015) 0%, rgba(255,215,0,0.035) 45%, rgba(255,255,255,0.02) 100%)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      }}
      {...(animateSection
        ? {
            initial: { opacity: 0, y: desktopMotion ? 36 : 10, scale: desktopMotion ? 0.97 : 1 },
            whileInView: { opacity: 1, y: 0, scale: 1 },
            viewport: { once: true, amount: 0.28 },
            transition: {
              duration: desktopMotion ? 0.8 : 0.3,
              delay: desktopMotion ? index * 0.08 : 0,
              ease: [0.16, 1, 0.3, 1],
            },
          }
        : {})}
    >
      <FramedImage src={image} alt={`${title} photo`} />

      <div className="space-y-4 lg:space-y-5">
        <h2
          className="font-heading text-3xl font-black leading-tight sm:text-4xl"
          style={{
            color: "#FFD700",
            textShadow: "0 0 24px rgba(255,215,0,0.18)",
          }}
        >
          {title}
        </h2>

        <p className="font-body text-[15px] leading-7 text-[#D4D4D8] sm:text-[17px]">{bio}</p>
        <StatBubbles stats={stats} />
      </div>
    </motion.section>
  );
}

export default function AboutPage() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const desktopMotion = !reduceMotion && !isMobile;
  const mobileMotion = !reduceMotion && isMobile;

  return (
    <main className="bg-black text-white">
      <header
        className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] px-5 sm:px-8 lg:px-10"
        style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="font-heading text-[22px] font-black tracking-tight text-[#FFD700]">SubSync</span>

        <div className="flex items-center gap-5 sm:gap-8">
          <Link
            href="/"
            className="rounded font-body text-sm text-[#94A3B8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Landing Page
          </Link>
          <Link
            href="/about"
            className="rounded font-body text-sm text-[#FFD700] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            About Us
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-14 pt-28 sm:px-8 lg:px-10 lg:pt-32">
        <div
          className="pointer-events-none absolute -top-40 left-[-20%] h-[340px] w-[340px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0) 68%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-[-12%] top-32 h-[280px] w-[280px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-[1180px] space-y-9 sm:space-y-12">
          <motion.div
            {...(desktopMotion || mobileMotion
              ? {
                  initial: { opacity: 0, y: desktopMotion ? 20 : 8 },
                  animate: { opacity: 1, y: 0 },
                  transition: {
                    duration: desktopMotion ? 0.7 : 0.25,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }
              : {})}
          >
            <p className="font-body text-xs uppercase tracking-[0.26em] text-[#FFD700]/80">Who We Are</p>
            <h1 className="mt-3 font-heading text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              About Us
            </h1>
          </motion.div>

          <AboutSection
            title={GROUP.name}
            bio={GROUP.bio}
            image={GROUP.image}
            stats={GROUP.stats}
            index={0}
            desktopMotion={desktopMotion}
            mobileMotion={mobileMotion}
          />

          {MEMBERS.map((member, index) => (
            <AboutSection
              key={member.name}
              title={member.name}
              bio={member.bio}
              image={member.image}
              stats={member.stats}
              index={index + 1}
              desktopMotion={desktopMotion}
              mobileMotion={mobileMotion}
            />
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
