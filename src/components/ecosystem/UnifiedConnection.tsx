"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const SYNC_CORE_COLOR = "#FFD60A";

// Keystone connection — the SubSync ∞ mark with every app icon orbiting it,
// wrapped in a honey card matching the other connection cards (sized ~1.3× one
// of those cards).
export function UnifiedConnection() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className="relative mx-auto mt-[34px] flex w-full max-w-[640px] flex-col items-center overflow-hidden rounded-2xl p-10"
      style={{
        background: "rgba(255, 214, 10, 0.05)",
        border: `1px solid ${SYNC_CORE_COLOR}22`,
      }}
      initial={reduceMotion ? undefined : { opacity: 0, y: 32 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: EASE }}
    >
      {/* Corner ambient glow — matches the other connection cards */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full blur-3xl"
        style={{ background: `${SYNC_CORE_COLOR}18` }}
        aria-hidden
      />

      {/* The subject image — transparent PNG, blends straight onto the card */}
      <motion.div
        className="relative w-full max-w-[420px]"
        initial={reduceMotion ? undefined : { opacity: 0, scale: 0.94 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
      >
        <Image
          src="/ecosystem/unified.png"
          alt="The SubSync infinity mark surrounded by all seven app icons"
          width={1672}
          height={941}
          sizes="(max-width: 768px) 100vw, 420px"
          className="h-auto w-full"
          priority={false}
        />
      </motion.div>

      {/* Copy */}
      <div className="relative mt-3 text-center">
        <h3 className="font-heading text-xl font-extrabold tracking-tight text-white md:text-2xl">
          Endlessly in{" "}
          <span style={{ color: SYNC_CORE_COLOR }}>Sync</span>.
        </h3>
        <p className="mx-auto mt-3 max-w-[52ch] font-body text-[15px] font-light leading-relaxed text-[#777]">
          Every app streams into one unified dashboard — finances, trips, focus,
          and memories flowing into a single live command center where your whole
          ecosystem stays perfectly in sync.
        </p>

        {/* Single Dashboard pill */}
        <div className="mt-5 flex justify-center">
          <span
            className="font-body text-[12px] font-semibold px-4 py-1.5 rounded-full"
            style={{
              color: SYNC_CORE_COLOR,
              background: `${SYNC_CORE_COLOR}12`,
              border: `1px solid ${SYNC_CORE_COLOR}30`,
            }}
          >
            Dashboard
          </span>
        </div>
      </div>
    </motion.article>
  );
}
