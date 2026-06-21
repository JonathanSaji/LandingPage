"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
const EASE = [0.16, 1, 0.3, 1] as const;

const LOGOS = [
  { name: "TravelSync",  src: "/logos/TravelSync.png" },
  { name: "BrainSync",   src: "/logos/BrainSync.png" },
  { name: "SeatSync",    src: "/logos/SeatSync.png" },
  { name: "PhotoSync",   src: "/logos/PhotoSync.png" },
  { name: "FluencySync", src: "/logos/FluencySync.png" },
  { name: "SteadySync",  src: "/logos/SteadySync.png" },
  { name: "TrackerSync", src: "/logos/TrackerSync.png" },
] as const;

export function CTASection() {
  const reduceMotion = useReducedMotion();

  function handleGetStarted() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("subsync:openAuth"));
    }, 500);
  }

  return (
    <section
      id="get-started"
      className="relative pt-16 pb-32 bg-black overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[140px]"
        style={{ background: "rgba(255, 214, 10, 0.07)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        <motion.div
          className="relative mx-auto w-full max-w-[1100px] rounded-3xl px-6 py-10 md:px-12 md:py-16 text-center"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
          {...(reduceMotion ? {} : {
            initial: { opacity: 0, y: 32 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-80px" },
            transition: { duration: 0.7, ease: EASE },
          })}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-48 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }}
            aria-hidden
          />

          {/* Logo row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3 mb-8 max-w-[280px] sm:max-w-none mx-auto">
            {LOGOS.map((logo, i) => (
              <motion.div
                key={logo.name}
                className="w-8 h-8 md:w-10 md:h-10 rounded-[8px] md:rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                {...(reduceMotion ? {} : {
                  initial: { opacity: 0, y: 12 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.5, delay: 0.1 + i * 0.05, ease: EASE },
                })}
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </motion.div>
            ))}
          </div>

          {/* Headline */}
          <motion.h2
            id="cta-heading"
            className="font-heading font-extrabold text-white mb-8"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
            }}
            {...(reduceMotion ? {} : {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.6, delay: 0.25, ease: EASE },
            })}
          >
            One account.{" "}
            <span style={{ color: "#FFD700" }}>Seven apps.</span>
            <br />
            Zero friction.
          </motion.h2>

          {/* CTA button */}
          <motion.div
            {...(reduceMotion ? {} : {
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.6, delay: 0.45, ease: EASE },
            })}
          >
            <button
              onClick={handleGetStarted}
              className="font-heading font-bold text-black px-10 py-4 rounded-xl text-[15px] transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              style={{
                background: "#FFD700",
                boxShadow: "0 0 40px rgba(255, 214, 10, 0.35)",
              }}
            >
              Get Started Today
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
