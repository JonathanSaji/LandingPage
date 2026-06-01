# Hero Section Transition Design Spec

**Date:** 2026-05-30  
**Status:** Approved

---

## Summary

Add a gradient fade overlay to the bottom of the HeroSection so the wave canvas dissolves into the plain black background of the ProductsSection instead of cutting off abruptly.

---

## Current State

The HeroSection's `HeroWave` canvas creates a visual texture that ends at the section boundary with a hard cut. ProductsSection is `bg-black` with no transition treatment, causing an abrupt visual jump.

---

## Target State

A short, crisp 80px gradient overlay pinned to the bottom of the HeroSection. The wave canvas fades to black naturally before the section boundary is reached.

### Implementation

**File:** `src/components/hero/HeroSection.tsx`

Add this div as the last child inside the `<section>` element:

```tsx
<div
  className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3]"
  style={{
    height: "80px",
    background: "linear-gradient(to bottom, transparent, #000000)",
  }}
  aria-hidden
/>
```

**z-index rationale:**
- HeroWave canvas: z-0
- Left vignette: z-[1]
- Main content grid: z-[2]
- This fade overlay: z-[3] — sits above wave and vignette, does not interfere with text content since the content is vertically centred and the bottom of the section is empty space

**No animation needed** — this is a static overlay. `useReducedMotion` does not apply.

---

## Files Changed

- `src/components/hero/HeroSection.tsx` — only file that needs editing

---

## Out of Scope

- No changes to ProductsSection, EcosystemSection, CTASection, or any other section
- No inter-section transitions beyond hero→products
