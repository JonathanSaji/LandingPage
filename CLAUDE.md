# CLAUDE.md — SubSync Landing Page

> Cinematic landing page for the SubSync ecosystem. Next.js 15 · Tailwind CSS v4 · Framer Motion 12.

---

## Project DNA

SubSync is a **living constellation** — seven specialized apps orbiting a shared intelligence layer called Sync Core. The visual language: **connection through light**. Nodes, filaments, pulses, and chromatic accents bleeding into one another at boundaries.

**Tone**: Cinematic, alive, premium. Active Theory depth + Zenly warmth + Dice.fm energy + Cowboy product clarity. Never a generic SaaS template.

**Color theme**: "Bumblebee" — near-black void with rich honey/amber accent. NOT the original blueprint's iris/violet palette; this has been updated.

---

## Commands

```bash
npm run dev      # dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

---

## Architecture

```
src/
  app/
    page.tsx              # Home: all sections composed here
    layout.tsx            # Root layout — Inter + Geist Mono fonts
    globals.css           # Tailwind v4 @theme + utility classes
    animations/page.tsx   # /animations — component playground
  components/
    animations/           # Full animation library (see below)
    brand/AppLogo.tsx     # AppLogo + AppLogoLockup
    cta/CTASection.tsx
    ecosystem/EcosystemSection.tsx
    features/FeaturesSection.tsx
    hero/
      HeroSection.tsx     # Main hero with scroll parallax
      SyncCoreVisual.tsx  # The orbiting node diagram
      StatsBar.tsx
    layout/
      AmbientBackground.tsx   # Fixed parallax orbs + grain
      MainLayout.tsx
      SiteNav.tsx             # Sticky glassmorphic nav
      SiteFooter.tsx
    products/
      ProductCard.tsx
      ProductsSection.tsx
    ui/
      Button.tsx          # motion.button with spring physics
      Reveal.tsx          # Scroll-triggered reveal wrapper
      SectionHeader.tsx
    why/WhySection.tsx
  lib/
    animations.ts         # Framer Motion presets & variants
    design-system.ts      # Canonical tokens (products, colors, motion)
    utils.ts              # cn() classname helper
```

---

## Design System Tokens

**Always import from `@/lib/design-system`** — never hardcode values that exist here.

### Colors (CSS variables in globals.css)

| Token | Value | Usage |
|-------|-------|-------|
| `void` | `#000000` | Page background |
| `void-elevated` | `#0A0A0A` | Cards |
| `pearl` | `#F5F5F7` | Primary text |
| `pearl-muted` | `#A1A1A6` | Body copy |
| `pearl-dim` | `#6E6E73` | Labels, meta |
| `honey` | `#FFD60A` | **Primary accent** — CTAs, glows, highlights |
| `honey-glow` | `#FFE566` | Hover states |
| `honey-deep` | `#E6B800` | Depth accents |

> **Note**: `iris` and `iris-glow` are aliased to honey values. Old blueprint used violet; current theme is honey/amber.

### Product Accents

All 7 products now use honey-family accents (see `src/lib/design-system.ts`). Each has both `accent` (hex) and `accentRgb` (space-separated RGB for use in `rgb(${product.accentRgb} / 0.3)` patterns).

### Typography Scale

```css
.text-hero-display   /* clamp(3.5rem, 10vw, 7.5rem), lh 0.92, ls -0.045em */
.text-section-title  /* clamp(2.25rem, 5vw, 4rem), lh 1.02, ls -0.035em */
```

Font stack: `Inter` (display + body) via `--font-inter`, `Geist Mono` via `--font-geist-mono`.

### Glass Utility Classes

These are the core visual building blocks. Use them together:

```css
.glass-panel    /* Heavy blur, highest elevation — hero cards, CTA box */
.glass-card     /* Medium blur — product cards, feature tiles */
.glass-nav      /* Nav-optimized — dark tint, horizontal */
.glass-pill     /* Light blur — badges, tags, node labels */
.specular-top   /* ::before pseudo 1px top highlight — add to any glass element */
```

### Glow & Gradient Utilities

```css
.glow-honey / .glow-iris    /* Box shadow glow — primary CTA buttons */
.text-gradient-honey        /* Gradient text — headlines, emphasis */
.grain-overlay              /* SVG noise at 3.5% opacity — add to decorative layers */
.section-divider            /* Full-width honey/25 gradient line */
.mask-fade-b                /* Bottom fade mask */
.mask-fade-radial           /* Radial fade mask */
```

---

## Animation System

### Import from `@/components/animations`

```typescript
import {
  // Primitives from @/lib/animations.ts
  fadeUp, fadeDown, scaleIn, slideFromLeft, slideFromRight,
  rotateIn, flipIn, blurIn, staggerContainer, staggerItem,
  easings, transitions, infiniteSpin, floatY, pulseGlow,
  glitchKeyframes, marqueeTransition,

  // Hooks
  useMotionSafe, useMotionEnabled,

  // Components
  StaggerGroup, StaggerItem,
  SplitTextReveal,       // Word/char 3D flip reveal
  MagneticHover,         // Cursor-following magnetic effect
  TiltCard,              // 3D tilt + glare on hover
  InfiniteMarquee,       // Seamless scroll marquee
  GlitchText,            // RGB glitch on interval
  TextScramble,          // Matrix decode on scroll entry
  PulseRings,            // Sonar ring expansion
  MorphingBlob,          // SVG morphing organic shape
  FloatingParticles,     // Ambient floating dots
  ScrollProgress,        // Thin top scroll bar
  OrbitCarousel,         // Items orbit a center
  ParallaxLayer,         // Scroll-linked Y transform
  CountUp,               // Spring-animated number
  DrawPath,              // SVG stroke draw on scroll
} from "@/components/animations";
```

### Core Easing Curves

```typescript
easings.outExpo      // [0.16, 1, 0.3, 1] — most reveals
easings.outBack      // [0.34, 1.56, 0.64, 1] — springy UI
easings.inOutCubic   // [0.65, 0, 0.35, 1] — slow cinematic
easings.elastic      // [0.68, -0.55, 0.265, 1.55] — bouncy
```

### Reduced Motion

**Every animation component respects `useReducedMotion()`**. Always handle it:

```typescript
const reduceMotion = useReducedMotion();
animate={reduceMotion ? undefined : { rotate: 360 }}
```

### Scroll Hooks Pattern

```typescript
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ["start start", "end start"],
});
const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
```

---

## Component Patterns

### Standard Section Shape

```tsx
<section id="section-id" className="relative py-[var(--spacing-section)]" aria-labelledby="heading-id">
  {/* Optional ambient orb */}
  <motion.div className="pointer-events-none absolute ... bg-honey/10 blur-[120px]" aria-hidden />

  <div className="relative mx-auto max-w-[1400px] px-[var(--spacing-container)]">
    <SectionHeader label="Eyebrow" title="Main headline" description="..." />

    {/* Content */}
  </div>
</section>
```

### Standard Card Shape

```tsx
<article className="group relative h-full overflow-hidden rounded-2xl glass-card p-6 specular-top transition-colors hover:border-honey/20 md:p-8">
  {/* Hover glow blob */}
  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100" style={{ backgroundColor: `rgb(${accentRgb} / 0.3)` }} />

  {/* Content with relative positioning */}
</article>
```

### Scroll-Triggered Reveal

Use `<Reveal>` for simple one-shot animations:
```tsx
<Reveal delay={0.1} direction="up">
  <YourContent />
</Reveal>
```

Use `<StaggerGroup>` for lists:
```tsx
<StaggerGroup as="ul" stagger={0.1}>
  <StaggerItem>Item 1</StaggerItem>
  <StaggerItem>Item 2</StaggerItem>
</StaggerGroup>
```

### Button

```tsx
<Button variant="primary" | "secondary" | "ghost">Text</Button>
```

Primary = honey bg, black text, glow shadow. Always use `motion.button` internally.

---

## The Seven Products

All data lives in `src/lib/design-system.ts`. Never hardcode product info inline.

| Product | ID | Accent |
|---------|-----|--------|
| TravelSync | `travel-sync` | `#FFD60A` honey |
| PhotoSync | `photo-sync` | `#FFE566` honey-glow |
| BrainSync | `brain-sync` | `#FFEB3B` yellow — **featured/hub** |
| FluencySync | `fluency-sync` | `#FFC400` amber |
| SteadySync | `steady-sync` | `#F5A623` warm amber |
| Subtracker | `subtracker` | `#E6B800` honey-deep |
| SeatSync | `seat-sync` | `#FFF176` pale yellow |

BrainSync is the **neural hub** — always treat it as primary/featured in layouts.

---

## Page Sections (in render order)

1. `HeroSection` — headline, SyncCoreVisual orbital diagram, product pills
2. `StatsBar` — 4 stats in glass panel
3. `EcosystemSection` — constellation diagram, 4-step flow (Capture → Pulse → Compound → Act)
4. `ProductsSection` — BrainSync featured (md:col-span-2), remaining 6 in grid
5. `FeaturesSection` — 6 feature cards in 3-col grid
6. `WhySection` — before/after contrasts + pillars
7. `CTASection` — email capture, full-width glass panel

---

## AmbientBackground

Fixed, `z-index: -10`. Contains:
- Three radial gradient orbs (honey tones, 15–30% opacity)
- SVG grain overlay at 3.5%
- Radial top glow
- Subtle grid pattern at 2% opacity
- Scroll-linked parallax on orbs via `useScroll`

Don't add another fixed background layer — extend this component instead.

---

## `/animations` Route

Interactive playground at `/animations`. Demo every animation component. When adding a new animation component, add a `<DemoCard>` entry here.

---

## Naming & File Conventions

- Components: PascalCase, one per file, named exports
- `"use client"` — on any component using hooks, motion, or event handlers
- Utility CSS classes: kebab-case, defined in `@layer utilities` in `globals.css`
- New sections: create `src/components/{section-name}/{SectionName}Section.tsx`
- New animation components: add to `src/components/animations/`, export from `index.ts`

---

## Key Rules

1. **Never hardcode colors** — use CSS variables (`text-honey`, `bg-void`, etc.) or design-system tokens
2. **Never break glass morphism** — all elevated surfaces use `.glass-card`, `.glass-panel`, or `.glass-pill` + `.specular-top`
3. **Always handle `useReducedMotion`** in every animated component
4. **Product data from design-system** — `import { products } from "@/lib/design-system"`
5. **`cn()` for classnames** — `import { cn } from "@/lib/utils"`
6. **Accessibility** — semantic HTML landmarks, `aria-hidden` on decorative elements, `aria-label` on icon buttons, focus rings using `ring-honey/50`
7. **Max content width** — always wrap in `max-w-[1400px] mx-auto px-[var(--spacing-container)]`
8. **Section vertical rhythm** — `py-[var(--spacing-section)]`
9. **Framer Motion** — animate only `transform` + `opacity` for GPU acceleration; use `will-change: transform` sparingly (hero visual only)
10. **Next.js Image** — always use `<Image>` from `next/image` for raster assets

---

## What's Next (Phase 3+)

Per `docs/SUBSYNC_BLUEPRINT.md`:

- **Phase 3**: Interactive ecosystem graph — draggable nodes with `layoutId` shared element transitions
- **Phase 4–5**: Product showcase scroll-linked mockup depth (`useTransform` scale + `rotateY`)
- **Phase 6+**: Testimonial carousel (`AnimatePresence mode="wait"`), footer polish

When implementing these, maintain the existing animation vocabulary and glass morphism system.