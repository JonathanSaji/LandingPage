# SubSync — Phase 1 Blueprint & Design System

> Creative direction: cinematic, alive, premium — inspired by Active Theory's depth, Zenly's warmth, Dice.fm's energy, and Cowboy's product clarity. Not a generic SaaS template.

---

## 1. Global Design System

### 1.1 Brand Essence

**SubSync** is a living constellation — seven specialized apps orbiting a shared intelligence layer ("Sync Core"). The visual language expresses **connection through light**: nodes, filaments, pulses, and chromatic accents that bleed into one another at boundaries.

### 1.2 Color Architecture

| Token | Hex / Value | Role |
|-------|-------------|------|
| `void` | `#030308` | Primary background — near-black with blue undertone |
| `void-elevated` | `#0A0A12` | Cards, elevated surfaces |
| `void-surface` | `#12121C` | Secondary panels |
| `pearl` | `#F4F2FF` | Primary text — soft white with violet hint |
| `pearl-muted` | `#A8A4C4` | Body copy, descriptions |
| `pearl-dim` | `#6B6788` | Labels, meta |
| `sync-core` | `#E8E4FF` | Central hub highlights |
| `iris` | `#7B5CFF` | Global brand accent — ties ecosystem together |
| `iris-glow` | `#9B7BFF` | Glows, gradients, hover states |

**Surface treatment:** 1px borders at `rgba(244,242,255,0.08)`, glass panels at `backdrop-blur-xl` + `bg-white/[0.03]`, inner highlights via `inset` box-shadows simulating rim lighting.

### 1.3 Typography

| Role | Family | Weights | Usage |
|------|--------|---------|-------|
| **Display** | [Syne](https://fonts.google.com/specimen/Syne) | 600–800 | Headlines, hero, section titles — geometric, futuristic |
| **Body** | [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) | 400–600 | Paragraphs, UI, nav |
| **Mono** | Geist Mono | 400–500 | Stats, badges, technical labels |

**Scale (fluid):**

- `hero-display`: `clamp(3.5rem, 10vw, 7.5rem)` — line-height `0.92`, letter-spacing `-0.04em`
- `section-title`: `clamp(2.25rem, 5vw, 4rem)` — line-height `1.0`
- `body-lg`: `clamp(1.0625rem, 1.5vw, 1.25rem)` — line-height `1.65`
- `label`: `0.6875rem` — uppercase, `tracking-[0.2em]`

### 1.4 Spacing & Layout

- **Max content width:** `1400px`
- **Horizontal padding:** `clamp(1.25rem, 4vw, 3rem)`
- **Section vertical rhythm:** `clamp(6rem, 14vw, 12rem)`
- **Grid:** 12-column mental model; hero uses asymmetric 7/5 split on desktop
- **Corner radius:** `rounded-2xl` (cards), `rounded-full` (pills, orbs)

### 1.5 Depth & Lighting

1. **Ambient orbs** — large blurred gradients (iris + product accents) at 15–25% opacity
2. **Film grain** — SVG noise overlay at 4% opacity (performance-safe, `pointer-events: none`)
3. **Rim light** — `box-shadow: inset 0 1px 0 rgba(255,255,255,0.06)` on glass surfaces
4. **Glow on interaction** — accent-colored `box-shadow` at 20–40px blur

### 1.6 Accessibility

- Minimum contrast 4.5:1 for body text on void
- `prefers-reduced-motion`: disable parallax, infinite loops, and scroll-scrubbed transforms
- Focus rings: `ring-2 ring-iris/60 ring-offset-2 ring-offset-void`
- Semantic landmarks: `header`, `main`, `nav`, `footer`

---

## 2. Seven-Product Breakdown

| Product | Accent | Tagline | Mini-Personality | Ecosystem Connection |
|---------|--------|---------|------------------|----------------------|
| **TravelSync** | `#2EE8D4` Aurora Teal | *Every journey, perfectly in rhythm.* | The wanderer — confident, worldly | Trip context → BrainSync + SteadySync |
| **PhotoSync** | `#FF4D8D` Neon Rose | *Memories that move with you.* | The curator — nostalgic, futuristic | Visual timeline → BrainSync + TravelSync |
| **BrainSync** | `#9B7BFF` Electric Violet | *Think faster. Remember everything.* | The oracle — calm, omniscient | **Neural hub** — all apps feed insights here |
| **FluencySync** | `#FFB84A` Solar Amber | *Fluency without friction.* | The polyglot — playful, encouraging | Vocabulary from travel + notes |
| **SteadySync** | `#3DDB8C` Verdant Mint | *Balance that actually sticks.* | The anchor — warm, grounded | Routines from goals + travel schedules |
| **Subtracker** | `#FF6B4A` Ember Coral | *Subscriptions, finally under control.* | The guardian — sharp, protective | Spend → BrainSync budgets |
| **SeatSync** | `#4DA3FF` Cobalt Pulse | *Live moments, locked in.* | The maestro — electric, social | Events ↔ Travel + Photo |

---

## 3. Animation & Interaction Strategy

### 3.1 Philosophy

Motion should feel **breathing, not bouncing** — slow ambient drift (Active Theory), playful micro-delights on hover (Zenly), rhythmic pulse on CTAs (Dice.fm), product clarity never sacrificed (Cowboy).

### 3.2 Framer Motion Patterns

| Pattern | API | Application |
|---------|-----|-------------|
| **Hero entrance** | `staggerChildren` + `delayChildren` on container | Headline words, CTAs, orb nodes cascade in |
| **Scroll parallax** | `useScroll` + `useTransform` | Background orbs, hero visual Y-shift, opacity fade |
| **Scroll progress** | `useScroll` on `main` | Future: section progress bar in nav |
| **Layout morph** | `layout` + `layoutId` | Product cards, ecosystem nodes (Phase 3+) |
| **Presence** | `AnimatePresence` | Mobile nav, tooltips, modal CTAs |
| **Spring physics** | `stiffness: 120, damping: 20` | Buttons, magnetic hover |
| **Snappy UI** | `stiffness: 400, damping: 30` | Toggles, pills |

### 3.3 Hero-Specific (Phase 2)

1. **Sync Core** — central orb with concentric rings rotating at different speeds (`rotate` infinite, counter-rotate inner)
2. **Satellite nodes** — 7 product dots orbit slowly; on hover, accent glow + scale 1.15
3. **Filament lines** — SVG paths from core to nodes with animated `stroke-dashoffset`
4. **Typography** — word-by-word reveal with `y: 40 → 0`, `opacity: 0 → 1`
5. **Scroll cue** — bouncing chevron fades out after first 80px scroll (`useScroll`)

### 3.4 Performance Guardrails

- Animate only `transform` and `opacity` where possible
- `will-change: transform` on hero visual only
- Pause infinite animations when tab hidden (`useReducedMotion` + visibility API in later phases)
- Lazy-load below-fold sections with `dynamic()` in Phase 3+

### 3.5 Future Phases (Preview)

- **Phase 3:** Interactive ecosystem graph — draggable nodes, `layoutId` shared element transitions
- **Phase 4–5:** Product showcases with scroll-linked mockup depth (`useTransform` scale + rotateY)
- **Phase 6+:** Testimonial carousel with `AnimatePresence mode="wait"`

---

## 4. Page Architecture Map

1. Hero ← **Phase 2**
2. Ecosystem visualization ← Phase 3
3. Product showcases (×7) ← Phase 4
4. Interactive mockups ← Phase 4
5. Ecosystem explanation ← Phase 5
6. Features ← Phase 5
7. Why SubSync ← Phase 5
8. CTA sections ← Phase 6
9. Testimonials ← Phase 6
10. Footer ← Phase 6

---

*Document version: Phase 1 complete. Implementation tokens live in `src/lib/design-system.ts`.*
