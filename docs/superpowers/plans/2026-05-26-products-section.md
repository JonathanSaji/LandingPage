# Products Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a horizontal scrolling carousel section below the hero that showcases all 7 SubSync apps as glass-morphism cards with arrow navigation, scroll-snap behavior, and per-app accent colors.

**Architecture:** Two components — `ProductCard` (individual card) and `ProductsSection` (scroll container + arrows + heading). Logo PNGs live in `public/logos/` so Next.js `<Image>` can serve them. TrackerSync and TravelSync have no PNG assets so they use styled lucide icons instead. A `.scrollbar-hide` CSS utility is added to `globals.css` to suppress the native scrollbar across browsers.

**Tech Stack:** Next.js 15, Tailwind CSS v4, Framer Motion 12, lucide-react, `next/image`

---

## Files

| File | Action |
|---|---|
| `public/logos/BrainSync.png` | Copy from `docs/brand/BrainSync.png` |
| `public/logos/FluencySync.png` | Copy from `docs/brand/FluencySync.png` |
| `public/logos/PhotoSync.png` | Copy from `docs/brand/PhotoSync.png` |
| `public/logos/SeatSync.png` | Copy from `docs/brand/SeatSync.png` |
| `public/logos/SteadySync.png` | Copy from `docs/brand/SteadySync.png` |
| `src/app/globals.css` | Modify — add `.scrollbar-hide` utility |
| `src/components/products/ProductCard.tsx` | Create |
| `src/components/products/ProductsSection.tsx` | Create |
| `src/app/page.tsx` | Modify — render ProductsSection below HeroSection |

---

### Task 1: Copy logo assets to public/

**Files:**
- Create: `public/logos/` directory with 5 PNG files

- [ ] **Step 1: Create public/logos directory and copy files**

```bash
mkdir -p public/logos
cp docs/brand/BrainSync.png public/logos/BrainSync.png
cp docs/brand/FluencySync.png public/logos/FluencySync.png
cp docs/brand/PhotoSync.png public/logos/PhotoSync.png
cp docs/brand/SeatSync.png public/logos/SeatSync.png
cp docs/brand/SteadySync.png public/logos/SteadySync.png
```

- [ ] **Step 2: Verify files are present**

```bash
ls public/logos/
```

Expected output:
```
BrainSync.png  FluencySync.png  PhotoSync.png  SeatSync.png  SteadySync.png
```

- [ ] **Step 3: Commit**

```bash
git add public/logos/
git commit -m "feat: add app logo assets to public/logos"
```

---

### Task 2: Add scrollbar-hide CSS utility

**Files:**
- Modify: `src/app/globals.css`

The native horizontal scrollbar must be hidden visually while still allowing scroll. This requires both the `scrollbar-width: none` (Firefox) and `::-webkit-scrollbar` (Chrome/Safari) rules. Tailwind v4 doesn't have a built-in scrollbar-hide utility so we add it manually.

- [ ] **Step 1: Open `src/app/globals.css` — current content is:**

```css
@import "tailwindcss";

@theme {
  --font-heading: var(--font-poppins), sans-serif;
  --font-body: var(--font-dm-sans), sans-serif;
}
```

- [ ] **Step 2: Add the utility layer below @theme**

Replace the file contents with:

```css
@import "tailwindcss";

@theme {
  --font-heading: var(--font-poppins), sans-serif;
  --font-body: var(--font-dm-sans), sans-serif;
}

@layer utilities {
  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

- [ ] **Step 3: Verify the dev server still compiles without errors**

Run: `npm run dev` (or check existing running server terminal)
Expected: No compilation errors in terminal

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add scrollbar-hide utility to globals.css"
```

---

### Task 3: Create ProductCard component

**Files:**
- Create: `src/components/products/ProductCard.tsx`

Each card is a glass panel with:
- A top border in the app's accent color
- A logo area (white rounded container for PNG logos, colored glass container for icon-only apps)
- Category badge, app name, description, hover "Explore →" link
- `whileInView` Framer Motion entrance so cards animate as they scroll into view
- `whileHover` subtle lift

- [ ] **Step 1: Create the file**

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface ProductCardProps {
  title: string;
  category: string;
  description: string;
  color: string;
  logoSrc?: string;
  LogoIcon?: LucideIcon;
  index: number;
}

export function ProductCard({
  title,
  category,
  description,
  color,
  logoSrc,
  LogoIcon,
  index,
}: ProductCardProps) {
  return (
    <motion.article
      className="relative flex-shrink-0 w-[300px] rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderTop: `2px solid ${color}`,
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6 }}
    >
      {/* Logo area */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden">
        {/* Ambient glow behind logo */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 70%, ${color}22, transparent 70%)`,
          }}
          aria-hidden
        />

        {logoSrc ? (
          /* PNG logos — white app-icon container so gray backgrounds look intentional */
          <div
            className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden bg-white p-1.5 shadow-lg"
            style={{ boxShadow: `0 0 32px ${color}44` }}
          >
            <Image
              src={logoSrc}
              alt={`${title} logo`}
              fill
              className="object-contain"
            />
          </div>
        ) : LogoIcon ? (
          /* Icon fallback — colored glass container */
          <div
            className="relative z-10 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `${color}20`,
              border: `1px solid ${color}40`,
              boxShadow: `0 0 32px ${color}44`,
            }}
          >
            <LogoIcon className="w-12 h-12" style={{ color }} aria-hidden />
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="px-6 pb-6 pt-4">
        {/* Category badge */}
        <span
          className="inline-block font-body text-[10px] font-medium tracking-[0.12em] uppercase px-2.5 py-1 rounded-full mb-3"
          style={{
            color,
            background: `${color}18`,
            border: `1px solid ${color}30`,
          }}
        >
          {category}
        </span>

        <h3 className="font-heading font-bold text-xl text-white tracking-tight mb-2">
          {title}
        </h3>

        <p className="font-body font-light text-sm text-[#94A3B8] leading-relaxed">
          {description}
        </p>

        {/* Explore link — visible on hover only */}
        <div
          className="mt-5 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color }}
          aria-hidden
        >
          Explore <span aria-hidden>→</span>
        </div>
      </div>
    </motion.article>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/products/ProductCard.tsx
git commit -m "feat: add ProductCard component"
```

---

### Task 4: Create ProductsSection with horizontal scroll

**Files:**
- Create: `src/components/products/ProductsSection.tsx`

The section contains:
- An eyebrow + heading (fade-up on scroll into view)
- A scroll container with `scroll-snap-type: x mandatory` and `scrollbar-hide`
- Left/right arrow buttons that call `scrollBy` on the container ref
- 7 `ProductCard` instances — 5 with PNG logos, 2 with lucide icon fallbacks

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
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
          {...FADE_UP}
        >
          The Sync Core Ecosystem
        </motion.p>
        <motion.h2
          id="products-heading"
          className="font-heading font-bold text-white tracking-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          {...FADE_UP}
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
          ←
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
          →
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/products/ProductsSection.tsx
git commit -m "feat: add ProductsSection horizontal scroll carousel"
```

---

### Task 5: Wire up page.tsx and visually verify

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx` with:**

```tsx
import { HeroSection } from "@/components/hero/HeroSection";
import { ProductsSection } from "@/components/products/ProductsSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProductsSection />
    </main>
  );
}
```

- [ ] **Step 2: Run type check and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: No errors or warnings

- [ ] **Step 3: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- ProductsSection renders below the hero with black background
- Eyebrow "THE SYNC CORE ECOSYSTEM" and heading "Seven apps. One ecosystem." appear
- 7 cards are visible in a horizontal row, first 3–4 visible then clipped
- Each card has its accent-colored top border
- BrainSync/SeatSync/PhotoSync/FluencySync/SteadySync show their PNG logos in white rounded containers
- TrackerSync shows a green TrendingUp icon, TravelSync shows a blue Plane icon
- Clicking ← / → arrows scrolls the row smoothly
- Hovering a card lifts it up and reveals the "Explore →" link
- No native scrollbar visible on the cards row
- Scrolling down from top triggers card entrance animations (fade up from y:40)

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: render ProductsSection on home page"
```
