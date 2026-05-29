# CTA Section Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the narrow CTASection glass panel with a wider one containing an app logo row, simplified copy, and a renamed CTA button.

**Architecture:** Single file edit to `src/components/cta/CTASection.tsx`. Remove the eyebrow label and body paragraph, widen the panel from `max-w-3xl` to `max-w-5xl`, add a staggered logo row using `next/image` for the six apps that have logo files and a `TrendingUp` lucide icon for TrackerSync which has no logo.

**Tech Stack:** Next.js 15, Framer Motion, Tailwind CSS, lucide-react

---

### Task 1: Rewrite CTASection

**Files:**
- Modify: `src/components/cta/CTASection.tsx`

No automated tests apply to a pure visual component. Verification is done by running the dev server and inspecting the section visually.

- [ ] **Step 1: Replace the file contents**

Open `src/components/cta/CTASection.tsx` and replace the entire file with:

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const LOGOS = [
  { name: "TrackerSync", src: null },
  { name: "TravelSync",  src: "/logos/TravelSync.avif" },
  { name: "BrainSync",   src: "/logos/BrainSync.avif" },
  { name: "SeatSync",    src: "/logos/SeatSync.avif" },
  { name: "PhotoSync",   src: "/logos/PhotoSync.avif" },
  { name: "FluencySync", src: "/logos/Fluency.avif" },
  { name: "SteadySync",  src: "/logos/SteadySync.avif" },
] as const;

export function CTASection() {
  function handleGetStarted() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("subsync:openAuth"));
    }, 500);
  }

  return (
    <section
      id="get-started"
      className="relative py-32 bg-black overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[140px]"
        style={{ background: "rgba(255, 214, 10, 0.07)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-10">
        <motion.div
          className="relative mx-auto max-w-5xl rounded-3xl px-12 py-16 text-center"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-48 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }}
            aria-hidden
          />

          {/* Logo row */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {LOGOS.map((logo, i) => (
              <motion.div
                key={logo.name}
                className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: EASE }}
                aria-label={logo.name}
              >
                {logo.src ? (
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <TrendingUp size={20} color="#FFD700" aria-hidden />
                )}
              </motion.div>
            ))}
          </div>

          {/* Headline */}
          <motion.h2
            id="cta-heading"
            className="font-heading font-black text-white mb-8"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          >
            One account.{" "}
            <span style={{ color: "#FFD700" }}>Seven apps.</span>
            <br />
            Zero friction.
          </motion.h2>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
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
```

- [ ] **Step 2: Verify the build compiles**

```bash
npm run build
```

Expected: no TypeScript errors, no import errors.

- [ ] **Step 3: Run dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000`, scroll to the bottom. Check:
- Panel is noticeably wider than before
- 7 logo icons appear in a row (6 images + 1 TrendingUp icon for TrackerSync)
- No eyebrow text, no body paragraph
- Button reads "Get Started Today"
- Clicking the button scrolls to top and opens the auth modal

- [ ] **Step 4: Commit**

```bash
git add src/components/cta/CTASection.tsx
git commit -m "feat: redesign CTA section with logo row and wider panel"
```
