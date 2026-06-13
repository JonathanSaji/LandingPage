# Infinity Connection — Design Spec

**Date:** 2026-06-13
**Section:** `EcosystemSection` ("The Sync Effect")
**Status:** Approved (via visual mockup), ready for implementation

## Goal

Add a third connection to the Ecosystem section. Unlike the existing two
connections (one-app-to-one-app horizontal connectors), this one represents
**all seven apps connecting through the central Dashboard**. It is rendered as
the seven product logos arranged along an **infinity (∞) curve**, with a glowing
honey line threading through them and a pulse of light travelling the loop
endlessly.

## Placement

- Lives inside `EcosystemSection`, **below** the existing 2-column grid of
  connection cards.
- **Full-width feature block** (constrained to the same `max-w-5xl` as the grid
  for alignment), signalling it is the keystone connection of the ecosystem.

## Visual

- An SVG lemniscate (infinity) path in honey (`#FFD60A` family), with a soft
  blurred halo underlay so the ∞ shape reads instantly, plus a crisp gradient
  stroke on top.
- A travelling light pulse (`<animateMotion>` along the path). **Disabled when
  `useReducedMotion()` is true.**
- The 7 real product logos (from `/logos/*.png`) ride the curve as small
  rounded tiles, each with a subtle brand-color glow. Layout: 4 on the left
  loop, 3 on the right loop. No center hub node.
- Centered title + description below the loop.

### Logo positions (normalized to a 380×190 / 2:1 coordinate space)

| App | x% | y% |
|-----|----|----|
| TrackerSync | 25.3 | 26.6 |
| TravelSync  | 14.7 | 49.7 |
| BrainSync   | 25.3 | 72.9 |
| SeatSync    | 43.7 | 67.6 |
| PhotoSync   | 62.6 | 28.7 |
| FluencySync | 85.3 | 49.7 |
| SteadySync  | 74.7 | 72.9 |

## Copy

- **Title:** "Endlessly in sync."
- **Description (~27 words, matches existing card length, names the dashboard):**
  "Every app streams into one unified dashboard — finances, trips, focus, and
  memories flowing into a single live command center where your whole ecosystem
  stays perfectly in sync."

## Implementation notes

- New component: `src/components/ecosystem/InfinityConnection.tsx`
  (`"use client"`), rendered by `EcosystemSection` after the grid.
- Container uses `aspect-[380/190]` so the SVG viewBox and the
  percentage-positioned logo overlays stay aligned.
- Reuse existing tokens/patterns: honey CSS colors, `font-heading` / `font-body`,
  `whileInView` reveal with the section's `EASE` curve.
- Respect `useReducedMotion` for the pulse and the reveal.

## Out of scope (YAGNI)

- No draggable / interactive nodes.
- No per-app pills on this card (the seven logos already convey the apps).
- No changes to the existing two connection cards.
