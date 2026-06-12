"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const SYNC_CORE_COLOR = "#FFD60A";

const CONNECTIONS = [
  {
    id: 1,
    topApp: { name: "TravelSync", color: "#F2994A", logoSrc: "/logos/TravelSync.png" as string | null },
    bottomApp: { name: "TrackerSync", color: "#CCFF00", logoSrc: "/logos/TrackerSync.png" as string | null },
    title: "Trip coming up? Your finances already know.",
    description:
      "TravelSync shares your upcoming trip with TrackerSync, which surfaces active subscriptions and payments during your travel window — nothing slips through while you're away.",
    borderColor: "#F2994A22",
    glowColor: "rgba(242, 153, 74, 0.06)",
  },
  {
    id: 2,
    topApp: { name: "TravelSync", color: "#F2994A", logoSrc: "/logos/TravelSync.png" as string | null },
    bottomApp: { name: "PhotoSync", color: "#A855F7", logoSrc: "/logos/PhotoSync.png" as string | null },
    title: "Complete Your Trip, Enjoy The Memories",
    description:
      "Once you have completed your trip, upload your photos to an album in PhotoSync and cherish your memories on the TravelSync website!",
    borderColor: "#A855F722",
    glowColor: "rgba(168, 85, 247, 0.04)",
  },
] as const;

export function EcosystemSection() {
  return (
    <section
      id="ecosystem"
      className="relative pt-14 pb-20 bg-black overflow-hidden"
      aria-labelledby="ecosystem-heading"
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px]"
        style={{ background: "rgba(255, 214, 10, 0.04)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-10">
        {/* Section header */}
        <div className="text-center mb-14">
          <motion.p
            className="font-body text-[11px] font-medium tracking-[0.14em] uppercase mb-3"
            style={{ color: SYNC_CORE_COLOR }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            The Sync Effect
          </motion.p>
          <motion.h2
            id="ecosystem-heading"
            className="font-heading font-extrabold text-white tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            Connectivity across{" "}
            <span style={{ color: SYNC_CORE_COLOR }}>your apps.</span>
          </motion.h2>
        </div>

        {/* Connection cards — 2×2 grid */}
        <div className="grid grid-cols-1 gap-[34px] md:grid-cols-2 max-w-5xl mx-auto">
          {CONNECTIONS.map((conn, i) => (
            <motion.article
              key={conn.id}
              className="relative overflow-hidden rounded-2xl p-8 flex flex-col gap-6"
              style={{
                background: conn.glowColor,
                border: `1px solid ${conn.borderColor}`,
              }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: i * 0.12, ease: EASE }}
            >
              {/* Corner ambient glow */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl"
                style={{ background: `${conn.topApp.color}18` }}
                aria-hidden
              />

              {/* Horizontal connector: left app → line → dot → line → right app */}
              <div className="relative flex items-center gap-2">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  aria-label={conn.topApp.name}
                >
                  {conn.topApp.logoSrc ? (
                    <Image src={conn.topApp.logoSrc} alt={conn.topApp.name} width={56} height={56} className="object-contain" />
                  ) : (
                    <TrendingUp size={24} color="#FFD700" aria-hidden />
                  )}
                </div>

                <div
                  className="flex-1 h-px"
                  style={{
                    background: `linear-gradient(to right, ${conn.topApp.color}, ${SYNC_CORE_COLOR})`,
                  }}
                />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: SYNC_CORE_COLOR,
                    boxShadow: `0 0 10px ${SYNC_CORE_COLOR}99`,
                  }}
                  aria-hidden
                />
                <div
                  className="flex-1 h-px"
                  style={{
                    background: `linear-gradient(to right, ${SYNC_CORE_COLOR}, ${conn.bottomApp.color})`,
                  }}
                />

                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  aria-label={conn.bottomApp.name}
                >
                  {conn.bottomApp.logoSrc ? (
                    <Image src={conn.bottomApp.logoSrc} alt={conn.bottomApp.name} width={56} height={56} className="object-contain" />
                  ) : (
                    <TrendingUp size={24} color="#FFD700" aria-hidden />
                  )}
                </div>
              </div>

              {/* Copy below the connector */}
              <div className="relative">
                <h3 className="font-heading font-extrabold text-white text-[17px] leading-snug mb-2">
                  {conn.title}
                </h3>
                <p className="font-body font-light text-[#666] text-[14px] leading-relaxed">
                  {conn.description}
                </p>

                {/* App name pills */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <span
                    className="font-body text-[10px] font-semibold px-3 py-1 rounded-full"
                    style={{
                      color: conn.topApp.color,
                      background: `${conn.topApp.color}12`,
                      border: `1px solid ${conn.topApp.color}30`,
                    }}
                  >
                    {conn.topApp.name}
                  </span>
                  <span
                    className="font-body text-[10px] font-semibold px-3 py-1 rounded-full"
                    style={{
                      color: conn.bottomApp.color,
                      background: `${conn.bottomApp.color}12`,
                      border: `1px solid ${conn.bottomApp.color}30`,
                    }}
                  >
                    {conn.bottomApp.name}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
