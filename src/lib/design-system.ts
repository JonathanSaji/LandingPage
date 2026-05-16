/**
 * SubSync Design System — canonical tokens for Tailwind + components.
 * See docs/SUBSYNC_BLUEPRINT.md for full creative direction.
 */

export const products = [
  {
    id: "travel-sync",
    name: "TravelSync",
    accent: "#FFD60A",
    accentRgb: "255 214 10",
    tagline: "Every journey, perfectly in rhythm.",
    personality: "The wanderer — confident, worldly, always three steps ahead.",
    connection:
      "Feeds live context from trips into BrainSync and SteadySync so your mind and body stay aligned on the road.",
  },
  {
    id: "photo-sync",
    name: "PhotoSync",
    accent: "#FFE566",
    accentRgb: "255 229 102",
    tagline: "Memories that move with you.",
    personality: "The curator — nostalgic yet futuristic, obsessed with beautiful recall.",
    connection:
      "Surfaces visual memories inside BrainSync timelines and TravelSync albums as one living gallery.",
  },
  {
    id: "brain-sync",
    name: "BrainSync",
    accent: "#FFEB3B",
    accentRgb: "255 235 59",
    tagline: "Think faster. Remember everything.",
    personality: "The oracle — calm, brilliant, quietly omniscient.",
    connection:
      "The neural hub — every SubSync app streams insights here to compound your second brain.",
  },
  {
    id: "fluency-sync",
    name: "FluencySync",
    accent: "#FFC400",
    accentRgb: "255 196 0",
    tagline: "Fluency without friction.",
    personality: "The polyglot — playful, encouraging, never patronizing.",
    connection:
      "Pulls vocabulary from TravelSync destinations and BrainSync notes for context-rich learning.",
  },
  {
    id: "steady-sync",
    name: "SteadySync",
    accent: "#F5A623",
    accentRgb: "245 166 35",
    tagline: "Balance that actually sticks.",
    personality: "The anchor — warm, grounded, scientifically gentle.",
    connection:
      "Adapts routines using BrainSync goals and TravelSync schedules so wellness fits real life.",
  },
  {
    id: "subtracker",
    name: "Subtracker",
    accent: "#E6B800",
    accentRgb: "230 184 0",
    tagline: "Subscriptions, finally under control.",
    personality: "The guardian — sharp, protective, delightfully ruthless with waste.",
    connection:
      "Syncs spend signals to BrainSync budgets and SteadySync financial wellness targets.",
  },
  {
    id: "seat-sync",
    name: "SeatSync",
    accent: "#FFF176",
    accentRgb: "255 241 118",
    tagline: "Live moments, locked in.",
    personality: "The maestro — electric, social, always front-row.",
    connection:
      "Links events to TravelSync itineraries and PhotoSync captures for unforgettable nights out.",
  },
] as const;

export type Product = (typeof products)[number];

export const colors = {
  void: "#000000",
  voidElevated: "#0A0A0A",
  voidSurface: "#111111",
  pearl: "#F5F5F7",
  pearlMuted: "#A1A1A6",
  pearlDim: "#6E6E73",
  syncCore: "#FFF9E6",
  honey: "#FFD60A",
  honeyGlow: "#FFE566",
  honeyDeep: "#E6B800",
  iris: "#FFD60A",
  irisGlow: "#FFE566",
  border: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(255, 214, 10, 0.35)",
} as const;

export const typography = {
  display: "var(--font-syne)",
  body: "var(--font-instrument)",
  mono: "var(--font-geist-mono)",
} as const;

export const spacing = {
  sectionY: "clamp(6rem, 14vw, 12rem)",
  containerX: "clamp(1.25rem, 4vw, 3rem)",
  maxWidth: "1400px",
} as const;

export const motion = {
  spring: { type: "spring" as const, stiffness: 120, damping: 20 },
  springSnappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  duration: {
    fast: 0.2,
    base: 0.4,
    slow: 0.8,
    cinematic: 1.2,
  },
} as const;
