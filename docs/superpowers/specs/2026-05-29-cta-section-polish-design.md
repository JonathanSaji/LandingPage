# CTASection Polish — Design Spec

**Date:** 2026-05-29  
**Status:** Approved

---

## Summary

Redesign the CTA section to match the Google Workspace CTA reference: wide glass panel, app logo row at the top, minimal copy, single CTA button. Remove the eyebrow label and body paragraph.

---

## Current State

- `max-w-3xl` glass panel (narrow, feels boxed)
- Eyebrow label: "Get Started"
- Headline: "One account. Seven apps. Zero friction."
- Body paragraph describing SubSync
- Button: "Create your account"
- Scroll-triggered fade-up animations per element

## Target State

### Layout
- Glass panel expanded from `max-w-3xl` → `max-w-5xl`
- Remove eyebrow label
- Remove body paragraph
- Vertical order: logo row → headline → button

### Logo Row
- 7 app logos in a centered horizontal row, `gap-3`
- Each logo: `<Image>` at 40×40px, `rounded-xl`, no border, no background
- Files (all from `/logos/`):
  - TravelSync → `TravelSync.avif`
  - BrainSync → `BrainSync.avif`
  - SeatSync → `SeatSync.avif`
  - PhotoSync → `PhotoSync.avif`
  - FluencySync → `Fluency.avif`
  - SteadySync → `SteadySync.avif`
  - TrackerSync → No logo file exists; render a `TrendingUp` lucide icon (20px) in a 40×40px container styled to match: `text-[#FFD700]`, no border, no background
- Logos animate in via staggered `fadeUp` on scroll entry

### Headline
- Text unchanged: "One account. Seven apps. Zero friction."
- Styling unchanged: large, bold, white with `#FFD700` accent on "Seven apps."

### Button
- Label changed from "Create your account" → **"Get Started Today"**
- Styling, glow shadow, and `handleGetStarted` scroll+auth behavior unchanged

### Animations
- Keep existing scroll-triggered fade-up pattern
- Add stagger to logo row: each icon animates in with a 0.05s delay per icon

---

## Files Changed

- `src/components/cta/CTASection.tsx` — only file that needs editing

---

## Out of Scope

- No changes to other sections
- No changes to button behavior or auth flow
