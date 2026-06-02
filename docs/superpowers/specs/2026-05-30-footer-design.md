# Footer Design Spec

**Date:** 2026-05-30  
**Status:** Approved

---

## Summary

Build a `SiteFooter` component and add it to the page below `CTASection`. Layout Option B: wordmark + tagline left, 7 app links in a grid right, divider, copyright bottom.

---

## Files

- **Create:** `src/components/layout/SiteFooter.tsx`
- **Modify:** `src/app/page.tsx` — import and add `<SiteFooter />` as last child of `<main>`

---

## Component: SiteFooter

### Outer structure

```tsx
<footer
  id="footer"
  className="relative bg-black border-t border-white/[0.06] py-16 px-10"
>
  <div className="mx-auto max-w-[1400px]">
    {/* top row */}
    {/* divider */}
    {/* bottom row */}
  </div>
</footer>
```

### Top row

Two columns via `flex justify-between items-start gap-16`:

**Left — Wordmark + tagline**
- `<span>` "SubSync" — `font-heading font-extrabold text-[22px] tracking-tight text-[#FFD700]`
- `<p>` "One ecosystem. Seven apps." — `font-body text-[13px] text-[#444] mt-2`

**Right — App links grid**
- `<nav aria-label="SubSync apps">` wrapping a `grid grid-cols-4 gap-x-10 gap-y-3`
- 7 `<a>` elements, each:
  - `href`: `https://${name.toLowerCase()}.sub-sync.ca`
  - `target="_blank" rel="noopener noreferrer"`
  - `className`: `font-body text-[13px] text-[#555] hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded`
  - Text: the app name (e.g. "TrackerSync")

App names and URLs in order:
| Name | URL |
|---|---|
| TrackerSync | https://trackersync.sub-sync.ca |
| TravelSync | https://travelsync.sub-sync.ca |
| BrainSync | https://brainsync.sub-sync.ca |
| SeatSync | https://seatsync.sub-sync.ca |
| PhotoSync | https://photosync.sub-sync.ca |
| FluencySync | https://fluencysync.sub-sync.ca |
| SteadySync | https://steadysync.sub-sync.ca |

### Divider

```tsx
<div className="my-10 h-px bg-white/[0.05]" aria-hidden />
```

### Bottom row

`flex justify-between items-center`:
- Left: `<p>` "© 2025 SubSync. All rights reserved." — `font-body text-[12px] text-[#333]`
- Right: nothing

### Animation

Wrap the entire `<div className="mx-auto max-w-[1400px]">` in a `<motion.div>`:

```tsx
<motion.div
  {...(reduceMotion ? {} : {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  })}
>
```

Import `useReducedMotion` from framer-motion and call it at the top of the component.

---

## page.tsx change

```tsx
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProductsSection />
      <EcosystemSection />
      <CTASection />
      <SiteFooter />
    </main>
  );
}
```

---

## Out of Scope

- No social media links
- No logo images in the footer
- No additional nav columns (legal, company, etc.)
