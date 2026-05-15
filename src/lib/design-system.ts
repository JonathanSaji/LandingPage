/**
 * SubSync Design System — canonical tokens for Tailwind + components.
 * See docs/SUBSYNC_BLUEPRINT.md for full creative direction.
 */

export const products = [
  {
    id: "travel-sync",
    name: "TravelSync",
    accent: "#2EE8D4",
    accentRgb: "46 232 212",
    tagline: "Every journey, perfectly in rhythm.",
    personality: "The wanderer — confident, worldly, always three steps ahead.",
    connection:
      "Feeds live context from trips into BrainSync and SteadySync so your mind and body stay aligned on the road.",
  },
  {
    id: "photo-sync",
    name: "PhotoSync",
    accent: "#FF4D8D",
    accentRgb: "255 77 141",
    tagline: "Memories that move with you.",
    personality: "The curator — nostalgic yet futuristic, obsessed with beautiful recall.",
    connection:
      "Surfaces visual memories inside BrainSync timelines and TravelSync albums as one living gallery.",
  },
  {
    id: "brain-sync",
    name: "BrainSync",
    accent: "#9B7BFF",
    accentRgb: "155 123 255",
    tagline: "Think faster. Remember everything.",
    personality: "The oracle — calm, brilliant, quietly omniscient.",
    connection:
      "The neural hub — every SubSync app streams insights here to compound your second brain.",
  },
  {
    id: "fluency-sync",
    name: "FluencySync",
    accent: "#FFB84A",
    accentRgb: "255 184 74",
    tagline: "Fluency without friction.",
    personality: "The polyglot — playful, encouraging, never patronizing.",
    connection:
      "Pulls vocabulary from TravelSync destinations and BrainSync notes for context-rich learning.",
  },
  {
    id: "steady-sync",
    name: "SteadySync",
    accent: "#3DDB8C",
    accentRgb: "61 219 140",
    tagline: "Balance that actually sticks.",
    personality: "The anchor — warm, grounded, scientifically gentle.",
    connection:
      "Adapts routines using BrainSync goals and TravelSync schedules so wellness fits real life.",
  },
  {
    id: "subtracker",
    name: "Subtracker",
    accent: "#FF6B4A",
    accentRgb: "255 107 74",
    tagline: "Subscriptions, finally under control.",
    personality: "The guardian — sharp, protective, delightfully ruthless with waste.",
    connection:
      "Syncs spend signals to BrainSync budgets and SteadySync financial wellness targets.",
  },
  {
    id: "seat-sync",
    name: "SeatSync",
    accent: "#4DA3FF",
    accentRgb: "77 163 255",
    tagline: "Live moments, locked in.",
    personality: "The maestro — electric, social, always front-row.",
    connection:
      "Links events to TravelSync itineraries and PhotoSync captures for unforgettable nights out.",
  },
] as const;

export type Product = (typeof products)[number];

export const colors = {
  void: "#030308",
  voidElevated: "#0A0A12",
  voidSurface: "#12121C",
  pearl: "#F4F2FF",
  pearlMuted: "#A8A4C4",
  pearlDim: "#6B6788",
  syncCore: "#E8E4FF",
  iris: "#7B5CFF",
  irisGlow: "#9B7BFF",
  border: "rgba(244, 242, 255, 0.08)",
  borderStrong: "rgba(244, 242, 255, 0.16)",
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
