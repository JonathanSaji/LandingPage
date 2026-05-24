# Hero Section Design — SubSync Landing Page
Date: 2026-05-23

## Overview
Full-viewport hero section for the SubSync landing page. Split layout: animated wave canvas background, hero copy on the left, radial orbital diagram on the right. Includes a top navigation bar.

---

## Files

| File | Action |
|---|---|
| `src/app/layout.tsx` | Modify — add Poppins + DM Sans via next/font/google |
| `src/app/globals.css` | Modify — add @theme font vars, base body reset |
| `src/app/page.tsx` | Modify — render HeroSection |
| `src/lib/utils.ts` | Create — cn() helper |
| `src/components/ui/badge.tsx` | Create — scratch Badge (Tailwind only) |
| `src/components/ui/button.tsx` | Create — scratch Button (Tailwind + @radix-ui/react-slot) |
| `src/components/ui/card.tsx` | Create — scratch Card (Tailwind only) |
| `src/components/ui/radial-orbital-timeline.tsx` | Create — adapted orbital component |
| `src/components/hero/HeroWave.tsx` | Create — canvas wave animation |
| `src/components/hero/HeroSection.tsx` | Create — full hero section |

## NPM Dependencies
- `lucide-react` — icons for orbital nodes
- `class-variance-authority` — variant logic for Button/Badge
- `@radix-ui/react-slot` — asChild pattern for Button

---

## Layout

- `min-h-screen`, `overflow-hidden`, `position: relative`, `background: #000000`
- Wave canvas: `position: absolute`, `inset: 0`, `z-index: 0`
- Left-side gradient vignette: linear gradient from `rgba(0,0,0,0.75)` at left edge to `rgba(0,0,0,0.1)` at the 60% mark — overlaid on canvas at z-1 to keep left-column text legible against the wave
- Nav bar: `position: absolute`, `top: 0`, `left: 0`, `right: 0`, `z-index: 10` — spans full width of hero
- Content wrapper: `position: relative`, `z-index: 2`, full height, `padding-top: 64px` (nav height), CSS grid `grid-cols-2`
- Left column: hero copy, vertically centered
- Right column: orbital diagram, centered

---

## Navigation Bar

- Absolutely positioned at top of HeroSection, spans full viewport width
- Background: `rgba(0,0,0,0.3)` + `backdrop-filter: blur(12px)`
- Border bottom: `1px solid rgba(255,255,255,0.06)`
- Height: 64px
- Logo: `SubSync` — Poppins 900, `#FFD700`, font-size 22px, letter-spacing -0.02em
- Links: `Apps`, `Features`, `Pricing` — DM Sans 500, 13px, `#94A3B8`, gap 32px
- CTA button: `Get Started` — `#FFD700` background, `#000000` text, Poppins 700, 13px, padding `8px 20px`, border-radius 8px
- Hover states: links fade to `#fff`; CTA scales to 1.02, background `#ffe033`
- Focus-visible: 2px `#FFD700` outline offset 2px on all interactive elements

---

## Hero Copy (Left Column)

Vertically centered below nav, left-aligned, max-width 560px, padding-left 80px.

### Typography
1. **Eyebrow** — `THE SYNC CORE ECOSYSTEM`
   - DM Sans 500, 11px, `#FFD700`, letter-spacing 0.14em, text-transform uppercase
2. **Headline line 1** — `Seven apps. Onesync.`
   - Poppins 900, `clamp(2.8rem, 6vw, 5.5rem)`, `#FFFFFF`, letter-spacing -0.03em, line-height 0.95
3. **Headline line 2** — `Infinite possibility.`
   - Same spec, color `#FFD700`
4. **Subhead** — `SubSync isn't another app — it's a connected universe where travel, memory, and focus pulse through one intelligent Sync Core.`
   - DM Sans 300, 16px, `#94A3B8`, line-height 1.75, max-width 440px
5. **CTA row** — gap 12px, margin-top 40px
   - Primary: `Get Started` — `#FFD700` bg, `#000` text, Poppins 700, 14px, padding `12px 28px`, border-radius 8px
   - Ghost: `Explore the Apps →` — transparent bg, `#fff` text, border `1px solid rgba(255,255,255,0.2)`, same padding

### Entrance Animations (Framer Motion)
All use `cubic-bezier(0.16, 1, 0.3, 1)`, `translateY(40px) → 0`, `opacity 0 → 1`.
- Eyebrow: delay 0.15s, duration 0.6s
- Headline line 1: delay 0.4s, duration 0.7s
- Headline line 2: delay 0.6s, duration 0.7s
- Subhead: delay 1.2s, duration 0.6s
- CTA row: delay 1.5s, duration 0.6s

---

## Wave Background (HeroWave.tsx)

`'use client'` component. Pixel-shader canvas animation from the provided prompt.

- `SCALE = 2` (renders at half resolution, drawn upscaled — performance)
- Resizes on `window.resize`
- Uses precomputed sin/cos lookup tables for performance
- Color formula produces blues + purples + greens at low intensity — matches brand wave feel
- Cleanup: removes resize listener on unmount, cancels animation frame

---

## Orbital Diagram (RadialOrbitalTimeline)

Adapted from the provided `radial-orbital-timeline.tsx`. Changes from the original:

1. `TimelineItem` interface gains a `color: string` field
2. Center core: replaces purple-blue-teal gradient with gold — `from-yellow-400 via-yellow-300 to-yellow-500` (or direct hex `#FFD700`)
3. Node rings: border color uses `item.color` instead of static `border-white/40`
4. Node background: uses `item.color` at 20% opacity instead of `bg-black`
5. Expanded card styling: glass surface (`bg-black/80`, `border-white/10`) matching SubSync brand
6. Auto-rotate speed: 0.3°/tick at 50ms interval (unchanged from original)

### App Data

```ts
[
  { id:1, title:'TrackerSync', color:'#10B981', icon: TrendingUp,
    date:'Finance', content:'Your financial engine. Track every dollar, spot every pattern.',
    category:'Finance', relatedIds:[2,3], status:'completed', energy:95 },

  { id:2, title:'TravelSync',  color:'#3B82F6', icon: Plane,
    date:'Travel', content:'Every trip, perfectly synced. Itineraries, bookings, memories — one place.',
    category:'Travel', relatedIds:[1,5], status:'completed', energy:88 },

  { id:3, title:'BrainSync',   color:'#8B5CF6', icon: Brain,
    date:'Focus', content:'Focus, amplified. Deep work sessions powered by your personal rhythm.',
    category:'Focus', relatedIds:[1,4], status:'in-progress', energy:72 },

  { id:4, title:'SeatSync',    color:'#F59E0B', icon: Calendar,
    date:'Scheduling', content:'Book your desk, your shift, your day. Workplace time-slot scheduling, simplified.',
    category:'Scheduling', relatedIds:[3,6], status:'in-progress', energy:65 },

  { id:5, title:'PhotoSync',   color:'#EC4899', icon: Camera,
    date:'Memory', content:'Memories, beautifully organized. Every photo in context.',
    category:'Memory', relatedIds:[2,7], status:'completed', energy:91 },

  { id:6, title:'FluencySync', color:'#06B6D4', icon: Mic,
    date:'Voice', content:'Your voice, perfected. Language learning that feels natural.',
    category:'Voice', relatedIds:[4,7], status:'in-progress', energy:58 },

  { id:7, title:'SteadySync',  color:'#FFD700', icon: Shield,
    date:'Access', content:'Stability at the core. One account, one subscription, all seven apps.',
    category:'Access', relatedIds:[5,6], status:'completed', energy:100 },
]
```

---

## UI Primitives (scratch builds)

### Badge
Minimal — renders a `<div>` with `inline-flex`, rounded-full, border. Variants: `default` (gold fill), `outline` (transparent). Uses `cva` from `class-variance-authority`.

### Button
Renders `<button>` or uses `Slot` from `@radix-ui/react-slot` when `asChild`. Variants: `default`, `outline`, `ghost`. Uses `cva`.

### Card / CardHeader / CardTitle / CardContent
Simple `<div>` wrappers with border, rounded-lg, bg matching SubSync glass surface. No external deps.

---

## Constraints
- All animations: only `transform` + `opacity` (no `transition-all`)
- Colors: only brand tokens — no default Tailwind blue/indigo
- No inline styles except where dynamic values are required (orbital position math)
- Every interactive element: hover + focus-visible + active states
- `'use client'` on HeroWave and HeroSection (both use browser APIs / Framer Motion)
