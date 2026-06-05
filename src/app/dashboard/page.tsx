"use client";

import { useEffect, useState, useRef, useCallback, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, X, ArrowUpRight, RefreshCw, Check, RotateCcw, MapPin, Calendar, Users } from "lucide-react";
import Sidebar from "@/components/ui/sidebar-with-submenu";
import { SettingsPopup } from "@/components/ui/settings-popup";
import { createPortal } from "react-dom";

const EASE = [0.16, 1, 0.3, 1] as const;

function overlaps(
  c1: { colStart: number; rowStart: number; colSpan: number; rowSpan: number },
  c2: { colStart: number; rowStart: number; colSpan: number; rowSpan: number }
) {
  return !(
    c1.colStart + c1.colSpan <= c2.colStart ||
    c2.colStart + c2.colSpan <= c1.colStart ||
    c1.rowStart + c1.rowSpan <= c2.rowStart ||
    c2.rowStart + c2.rowSpan <= c1.rowStart
  );
}

function isLayoutValid(tilesList: AppTile[]) {
  for (let i = 0; i < tilesList.length; i++) {
    const t1 = tilesList[i];
    const c1 = {
      colStart: t1.colStart ?? 1,
      rowStart: t1.rowStart ?? 1,
      colSpan: t1.colSpan,
      rowSpan: t1.rowSpan,
    };
    if (c1.colStart < 1 || c1.colStart + c1.colSpan - 1 > 4) {
      return false;
    }
    for (let j = i + 1; j < tilesList.length; j++) {
      const t2 = tilesList[j];
      const c2 = {
        colStart: t2.colStart ?? 1,
        rowStart: t2.rowStart ?? 1,
        colSpan: t2.colSpan,
        rowSpan: t2.rowSpan,
      };
      if (overlaps(c1, c2)) {
        return false;
      }
    }
  }
  return true;
}

interface AppTile {
  id: string;
  name: string;
  category: string;
  accent: string;
  logo: string | null;
  description: string;
  features: string[];
  colSpan: number;
  rowSpan: number;
  colStart?: number;
  rowStart?: number;
}

interface TileLayout {
  id: string;
  colSpan: number;
  rowSpan: number;
  colStart: number;
  rowStart: number;
}

const LAYOUT_KEY = "subsync_dashboard_layout";

function loadLayout(): TileLayout[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLayout(layout: TileLayout[]) {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
}

const DEFAULT_TILES: AppTile[] = [
  {
    id: "trackersync",
    name: "TrackerSync",
    category: "FINANCE",
    accent: "#CCFF00",
    logo: "/logos/TrackerSync.png",
    description:
      "Your financial engine. Track every dollar, spot every pattern, and let AI surface insights you'd never find alone.",
    features: [
      "Real-time expense tracking",
      "AI-powered spending insights",
      "Multi-account sync",
      "Smart categorization",
    ],
    colSpan: 2,
    rowSpan: 2,
    colStart: 1,
    rowStart: 1,
  },
  {
    id: "travelsync",
    name: "TravelSync",
    category: "TRAVEL",
    accent: "#F2994A",
    logo: "/logos/TravelSync.avif",
    description:
      "Every trip, perfectly synced. Itineraries, bookings, and memories flow through one intelligent timeline.",
    features: [
      "Itinerary management",
      "Flight & hotel sync",
      "Travel memory journal",
      "Smart packing lists",
    ],
    colSpan: 1,
    rowSpan: 1,
    colStart: 3,
    rowStart: 1,
  },
  {
    id: "brainsync",
    name: "BrainSync",
    category: "FOCUS",
    accent: "#FFD700",
    logo: "/logos/BrainSync.avif",
    description:
      "Focus, amplified. Deep work sessions powered by your personal rhythm and cognitive patterns.",
    features: [
      "Deep work timer",
      "Focus pattern analysis",
      "Distraction blocking",
      "Energy optimization",
    ],
    colSpan: 1,
    rowSpan: 1,
    colStart: 4,
    rowStart: 1,
  },
  {
    id: "seatsync",
    name: "SeatSync",
    category: "SCHEDULING",
    accent: "#39FF14",
    logo: "/logos/SeatSync.avif",
    description:
      "Book your desk, your shift, your day. Workplace scheduling, simplified and intelligent.",
    features: [
      "Desk booking",
      "Shift management",
      "Team coordination",
      "Space optimization",
    ],
    colSpan: 1,
    rowSpan: 1,
    colStart: 3,
    rowStart: 2,
  },
  {
    id: "photosync",
    name: "PhotoSync",
    category: "MEMORY",
    accent: "#A259FF",
    logo: "/logos/PhotoSync.avif",
    description:
      "Memories, beautifully organized. Every photo finds its context, story, and meaning.",
    features: [
      "AI photo organization",
      "Memory timelines",
      "Smart albums",
      "Cross-device sync",
    ],
    colSpan: 1,
    rowSpan: 1,
    colStart: 4,
    rowStart: 2,
  },
  {
    id: "fluencysync",
    name: "FluencySync",
    category: "VOICE",
    accent: "#FF3C38",
    logo: "/logos/Fluency.avif",
    description:
      "Your voice, perfected. Language learning that adapts to how you actually speak and think.",
    features: [
      "Speech recognition",
      "Pronunciation coach",
      "Conversation practice",
      "Progress tracking",
    ],
    colSpan: 1,
    rowSpan: 1,
    colStart: 1,
    rowStart: 3,
  },
  {
    id: "steadysync",
    name: "SteadySync",
    category: "ACCESS",
    accent: "#3A7B7B",
    logo: "/logos/SteadySync.avif",
    description:
      "Stability at the core. One account, one subscription, all seven apps unified under one roof.",
    features: [
      "Unified account",
      "Single subscription",
      "Cross-app data",
      "Priority support",
    ],
    colSpan: 2,
    rowSpan: 1,
    colStart: 2,
    rowStart: 3,
  },
];

function applyLayoutToTiles(tiles: AppTile[], layout: TileLayout[]): AppTile[] {
  const layoutMap = new Map(layout.map((l) => [l.id, l]));
  return tiles.map((t) => {
    const l = layoutMap.get(t.id);
    return l ? { ...t, colSpan: l.colSpan, rowSpan: l.rowSpan, colStart: l.colStart, rowStart: l.rowStart } : t;
  });
}

interface Subscription {
  id: string;
  name: string;
  amount: string;
  date: string;
  color: string;
  billingCycle: string;
  subscriptionType: string;
  isTrial: boolean;
  amountPerCycle: string;
  personalValue: number;
}

interface Trip {
  id: string;
  name: string;
  location: string | null;
  dates: string | null;
  group: string | null;
  peopleCount: number;
  budget: string | null;
  updatedAt: string;
}

interface BrainPreset {
  id: string;
  title: string;
  intent: string;
  duration: number;
  stats: string;
  created_at: string;
}

interface BrainInsight {
  id: string;
  title: string;
  intent: string;
  duration: number;
  start_time: string | number;
  end_time: string | number;
  completed_at: string;
  analytics: {
    focusScore?: number;
    distractionsBlocked?: number;
  } | null;
}

/* ─── Edit Mode Resize Sizes ─── */
const SNAP_SIZES = [
  { label: "Small", colSpan: 1, rowSpan: 1 },
  { label: "Med Hor", colSpan: 2, rowSpan: 1 },
  { label: "Med Vert", colSpan: 1, rowSpan: 2 },
  { label: "Large", colSpan: 2, rowSpan: 2 },
];

function snapToSize(colSpan: number, rowSpan: number) {
  let best = SNAP_SIZES[0];
  let bestDist = Infinity;
  for (const s of SNAP_SIZES) {
    const dist = Math.abs(s.colSpan - colSpan) + Math.abs(s.rowSpan - rowSpan);
    if (dist < bestDist) { bestDist = dist; best = s; }
  }
  return best;
}

/* ─── 3D Tilt Card ─── */
const BentoCard = forwardRef<HTMLDivElement, {
  tile: AppTile;
  index: number;
  onExpand: () => void;
  subscriptions?: Subscription[];
  trips?: Trip[];
  presets?: BrainPreset[];
  insights?: BrainInsight[];
  loading?: boolean;
  isEditMode?: boolean;
  isBeingDragged?: boolean;
  isDropTarget?: boolean;
  onResizeCommit?: (index: number, colSpan: number, rowSpan: number) => void;
  onPointerDownDrag?: (index: number, e: React.PointerEvent<HTMLElement>) => void;
}>(function BentoCard({
  tile,
  index,
  onExpand,
  subscriptions = [],
  trips = [],
  presets = [],
  insights = [],
  loading = false,
  isEditMode = false,
  isBeingDragged = false,
  onResizeCommit,
  onPointerDownDrag,
}, forwardedRef) {
  const cardRef = useRef<HTMLDivElement>(null);
  // Merge internal ref with forwarded ref
  const mergedRef = useCallback((node: HTMLDivElement | null) => {
    (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [forwardedRef]);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * -8;
      const tiltY = (x - 0.5) * 8;
      setTilt({ rotateX: tiltX, rotateY: tiltY });
      setGlowPos({ x: x * 100, y: y * 100 });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  // ── Resize handle logic ──
  const [liveSize, setLiveSize] = useState({ colSpan: tile.colSpan, rowSpan: tile.rowSpan });
  const liveSizeRef = useRef({ colSpan: tile.colSpan, rowSpan: tile.rowSpan });

  const [resizeState, setResizeState] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    setLiveSize({ colSpan: tile.colSpan, rowSpan: tile.rowSpan });
    liveSizeRef.current = { colSpan: tile.colSpan, rowSpan: tile.rowSpan };
  }, [tile.colSpan, tile.rowSpan]);

  function handleResizePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const startW = rect.width;
    const startH = rect.height;
    const startX = e.clientX;
    const startY = e.clientY;

    setResizeState({ width: startW, height: startH });

    function onMove(mv: PointerEvent) {
      const dx = mv.clientX - startX;
      const dy = mv.clientY - startY;

      // Calculate container cell size dynamically
      const gridEl = cardRef.current?.parentElement;
      const gridW = gridEl ? gridEl.getBoundingClientRect().width : 1200;
      const dynamicCellW = (gridW - 16 * 3) / 4;
      const cellWAndGap = dynamicCellW + 16;
      const cellHAndGap = 190 + 16;

      // Smooth pixel resizing with safe min bounds (at least 1 cell size)
      const newW = Math.max(dynamicCellW, startW + dx);
      const newH = Math.max(190, startH + dy);

      setResizeState({ width: newW, height: newH });

      // Snapped spans for preview
      const rawCol = Math.max(1, Math.min(4, Math.round((newW + 16) / cellWAndGap)));
      const rawRow = Math.max(1, Math.min(2, Math.round((newH + 16) / cellHAndGap)));
      const snapped = snapToSize(rawCol, rawRow);

      liveSizeRef.current = snapped;
      setLiveSize({ colSpan: snapped.colSpan, rowSpan: snapped.rowSpan });
    }

    function onUp() {
      const snapped = liveSizeRef.current;
      onResizeCommit?.(index, snapped.colSpan, snapped.rowSpan);
      setResizeState(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const displayCol = isEditMode ? liveSize.colSpan : tile.colSpan;
  const displayRow = isEditMode ? liveSize.rowSpan : tile.rowSpan;
  const isTall = displayRow === 2;
  const isWide = displayCol === 2;
  const startCol = tile.colStart ?? 1;
  const startRow = tile.rowStart ?? 1;
  const compactSubLimit = isTall ? 2 : 1;
  const compactTripLimit = isTall ? 2 : 1;

  // Sorting closest upcoming subscriptions
  const getSortedUpcoming = (): Subscription[] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sorted = [...subscriptions].sort((a, b) => {
      const dateA = new Date(a.date + "T00:00:00");
      const dateB = new Date(b.date + "T00:00:00");

      const diffA = dateA.getTime() - now.getTime();
      const diffB = dateB.getTime() - now.getTime();

      // If both are in the future/today, sort ascending (closest renewal first)
      if (diffA >= 0 && diffB >= 0) return diffA - diffB;
      // If one is in the future and one in the past, prioritize future
      if (diffA >= 0 && diffB < 0) return -1;
      if (diffB >= 0 && diffA < 0) return 1;
      // If both are in the past, sort descending (most recent past first)
      return diffB - diffA;
    });

    return sorted.slice(0, compactSubLimit);
  };

  const displaySubs = getSortedUpcoming();
  const displayTrips = trips.slice(0, compactTripLimit);

  return (
    <motion.div
      ref={mergedRef}
      layout
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { type: "spring", stiffness: 320, damping: 28 },
        opacity: { duration: 0.7, ease: EASE, delay: 0.12 + index * 0.06 },
        y: { duration: 0.7, ease: EASE, delay: 0.12 + index * 0.06 },
      }}
      onMouseMove={!isEditMode ? handleMouseMove : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={isEditMode ? undefined : onExpand}
      onPointerDown={isEditMode ? (e) => onPointerDownDrag?.(index, e) : undefined}
      className={`relative overflow-hidden select-none ${isEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
        }`}
      style={{
        gridColumn: `${startCol} / span ${displayCol}`,
        gridRow: `${startRow} / span ${displayRow}`,
        perspective: "800px",
        opacity: isBeingDragged ? 0.35 : 1,
        pointerEvents: isBeingDragged ? "none" : undefined,
        width: resizeState ? `${resizeState.width}px` : undefined,
        height: resizeState ? `${resizeState.height}px` : undefined,
        minHeight: resizeState ? undefined : (displayRow === 2 ? "396px" : "190px"),
        outline: isEditMode ? `2px dashed rgba(255,215,0,0.25)` : undefined,
        outlineOffset: isEditMode ? "4px" : undefined,
        borderRadius: isEditMode ? "24px" : undefined,
        transition: "outline 0.15s ease, transform 0.15s ease",
      }}
    >
      <motion.div
        className="relative h-full w-full overflow-hidden"
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        style={{
          transformStyle: "preserve-3d",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: isHovered
            ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 ${tile.accent}15`
            : `0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 ${tile.accent}10`,
        }}
      >
        {/* Accent top edge glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent 0%, ${tile.accent}88 30%, ${tile.accent} 50%, ${tile.accent}88 70%, transparent 100%)`,
          }}
        />

        {/* Hover shine / spotlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.4s ease",
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${tile.accent}08 0%, transparent 60%)`,
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 flex h-full flex-col justify-between"
          style={{ padding: isTall ? "28px" : isWide ? "20px 24px" : "22px" }}
        >
          {/* Top: Category + Logo */}
          <div className="flex items-start justify-between">
            <div>
              <p
                className="font-body font-semibold uppercase"
                style={{
                  color: tile.accent,
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  opacity: 0.9,
                }}
              >
                {tile.category}
              </p>
              <h2
                className="font-heading font-bold text-white mt-1"
                style={{ fontSize: isTall || isWide ? "22px" : "18px" }}
              >
                {tile.name}
              </h2>
            </div>

            <motion.div
              className="flex items-center justify-center"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: `${tile.accent}0D`,
                border: `1px solid ${tile.accent}1A`,
                flexShrink: 0,
              }}
              animate={{
                scale: isHovered ? 1.08 : 1,
                borderColor: isHovered
                  ? `${tile.accent}40`
                  : `${tile.accent}1A`,
              }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {tile.logo ? (
                <Image
                  src={tile.logo}
                  alt={`${tile.name} logo`}
                  width={26}
                  height={26}
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <TrendingUp size={22} color={tile.accent} />
              )}
            </motion.div>
          </div>

          {/* Body Section */}
          {tile.name === "TrackerSync" ? (
            <div className="mt-4 flex min-h-0 flex-1 flex-col justify-between">
              <p
                className="font-body font-bold"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  color: "rgba(255, 255, 255, 0.4)",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Upcoming Renewals
              </p>

              {loading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255, 215, 0, 0.1)",
                      borderTopColor: tile.accent,
                      animation: "sb-spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : displaySubs.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-4 bg-white/[0.01]">
                  <p className="font-body text-xs text-white/40 text-center">
                    No active subscriptions tracked.
                  </p>
                  <p className="font-body text-[10px] text-white/20 text-center mt-1">
                    Ready to track your first recurring expense.
                  </p>
                </div>
              ) : (
                <div
                  className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden"
                  style={{ gap: isTall ? "8px" : "6px" }}
                >
                  {displaySubs.map((sub) => {
                    const subAccent = sub.color || tile.accent;
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const renewalDate = new Date(sub.date + "T00:00:00");
                    const diffTime = renewalDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    let daysLabel = "";
                    if (diffDays === 0) daysLabel = "Today";
                    else if (diffDays === 1) daysLabel = "Tomorrow";
                    else if (diffDays === -1) daysLabel = "Yesterday";
                    else if (diffDays < 0) daysLabel = `${Math.abs(diffDays)}d ago`;
                    else daysLabel = `in ${diffDays}d`;

                    const formattedDate = renewalDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={sub.id}
                        className="group flex min-w-0 items-center justify-between gap-3 rounded-xl transition-all duration-300 hover:bg-white/[0.04]"
                        style={{
                          padding: isTall ? "10px 14px" : "8px 10px",
                          background: `${tile.accent}06`,
                          border: `1px solid ${tile.accent}30`,
                          boxShadow: `0 0 18px ${tile.accent}12, inset 0 1px 0 ${tile.accent}12`,
                        }}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "3px",
                              background: subAccent,
                              boxShadow: `0 0 8px ${subAccent}80`,
                              flexShrink: 0,
                            }}
                          />
                          <div className="min-w-0">
                            <p
                              className="truncate font-body font-bold text-white transition-colors group-hover:text-[#CCFF00]"
                              style={{ fontSize: isTall || isWide ? "13px" : "12px" }}
                              title={sub.name}
                            >
                              {sub.name}
                            </p>
                            <p className="truncate font-body text-[10px] text-white/45">
                              {formattedDate} • <span style={{ color: diffDays >= 0 ? tile.accent : "rgba(255, 100, 100, 0.7)" }}>{daysLabel}</span>
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-body text-[13px] font-bold" style={{ color: subAccent }}>
                            ${parseFloat(sub.amount).toFixed(2)}
                          </p>
                          <p className="font-body text-[9px] uppercase tracking-wide text-white/35">
                            {sub.billingCycle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tap to preview hint */}
              <motion.div
                className="pointer-events-none absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 font-body"
                style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <span>Tap to preview</span>
                <ArrowUpRight size={11} />
              </motion.div>
            </div>
          ) : tile.name === "TravelSync" ? (
            <div className="mt-3 flex min-h-0 flex-1 flex-col justify-between">
              <p
                className="font-body font-bold uppercase"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  color: "rgba(255, 255, 255, 0.4)",
                  marginBottom: "6px",
                }}
              >
                {displayTrips.length > 1 ? "Your Trips" : "Your Trip"}
              </p>

              {loading ? (
                <div className="flex flex-1 items-center justify-center py-4">
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "2px solid rgba(242, 153, 74, 0.15)",
                      borderTopColor: tile.accent,
                      animation: "sb-spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : displayTrips.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-3">
                  <p className="font-body text-center text-[11px] text-white/40">No trips planned yet.</p>
                </div>
              ) : (
                <div
                  className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden"
                  style={{ gap: isTall ? "8px" : "6px" }}
                >
                  {displayTrips.map((trip) => {
                    const peopleText = `${trip.peopleCount} ${trip.peopleCount === 1 ? "person" : "people"}${trip.group ? ` · ${trip.group}` : ""}`;
                    return (
                      <div
                        key={trip.id}
                        className="rounded-xl transition-all duration-300 hover:bg-white/[0.04]"
                        style={{
                          padding: isTall ? "10px 12px" : "8px 10px",
                          background: `${tile.accent}06`,
                          border: `1px solid ${tile.accent}30`,
                          boxShadow: `inset 0 1px 0 ${tile.accent}12`,
                        }}
                      >
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <p
                            className="min-w-0 truncate font-body font-bold text-white"
                            style={{ fontSize: isTall || isWide ? "12px" : "11px", lineHeight: 1.2 }}
                            title={trip.name}
                          >
                            {trip.name}
                          </p>
                          {trip.budget && (isTall || isWide) ? (
                            <span className="shrink-0 font-body text-[9px] uppercase tracking-wide text-white/35">
                              {trip.budget}
                            </span>
                          ) : null}
                        </div>
                        <div
                          className={isWide ? "mt-2 grid grid-cols-3 gap-2" : "mt-1.5 flex flex-col gap-1.5"}
                        >
                          {trip.location ? (
                            <p className="flex min-w-0 items-center gap-1.5 truncate font-body text-[10px] text-white/75">
                              <MapPin size={11} color={tile.accent} className="shrink-0" />
                              <span className="truncate">{trip.location}</span>
                            </p>
                          ) : null}
                          {trip.dates ? (
                            <p className="flex min-w-0 items-center gap-1.5 truncate font-body text-[10px] text-white/75">
                              <Calendar size={11} color={tile.accent} className="shrink-0" />
                              <span className="truncate">{trip.dates}</span>
                            </p>
                          ) : null}
                          <p className="flex min-w-0 items-center gap-1.5 truncate font-body text-[10px] text-white/75">
                            <Users size={11} color={tile.accent} className="shrink-0" />
                            <span className="truncate">{peopleText}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <motion.div
                className="pointer-events-none absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 font-body"
                style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <span>Tap to preview</span>
                <ArrowUpRight size={10} />
              </motion.div>
            </div>
          ) : tile.name === "BrainSync" ? (
            <div className="mt-3 flex min-h-0 flex-1 flex-col justify-between">
              <p
                className="font-body font-bold uppercase"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  color: "rgba(255, 255, 255, 0.4)",
                  marginBottom: "6px",
                }}
              >
                Recent focus sessions
              </p>

              {loading ? (
                <div className="flex flex-1 items-center justify-center py-4">
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255, 215, 0, 0.1)",
                      borderTopColor: tile.accent,
                      animation: "sb-spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : insights.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-3">
                  <p className="font-body text-center text-[11px] text-white/40">No focus sessions found.</p>
                </div>
              ) : (
                <div
                  className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden"
                  style={{ gap: isTall ? "8px" : "6px" }}
                >
                  {insights.slice(0, compactSubLimit).map((insight) => {
                    const focusScore = insight.analytics?.focusScore ?? 90;
                    return (
                      <div
                        key={insight.id}
                        className="group flex min-w-0 items-center justify-between gap-3 rounded-xl transition-all duration-300 hover:bg-white/[0.04]"
                        style={{
                          padding: isTall ? "10px 14px" : "8px 10px",
                          background: `${tile.accent}06`,
                          border: `1px solid ${tile.accent}30`,
                          boxShadow: `0 0 18px ${tile.accent}12, inset 0 1px 0 ${tile.accent}12`,
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate font-body font-bold text-white transition-colors group-hover:text-[#FFD700]"
                            style={{ fontSize: isTall || isWide ? "13px" : "12px" }}
                            title={insight.title}
                          >
                            {insight.title}
                          </p>
                          <p className="truncate font-body text-[10px] text-white/45 mt-0.5">
                            {insight.intent} • {insight.duration}m
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-body text-[13px] font-bold" style={{ color: tile.accent }}>
                            {focusScore}% Focus
                          </p>
                          <p className="font-body text-[9px] uppercase tracking-wide text-white/35">
                            Blocked: {insight.analytics?.distractionsBlocked ?? 0}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <motion.div
                className="pointer-events-none absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1 font-body"
                style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <span>Tap to preview</span>
                <ArrowUpRight size={10} />
              </motion.div>
            </div>
          ) : (
            <>
              <div
                style={{
                  height: "1px",
                  background: `linear-gradient(90deg, ${tile.accent}15, rgba(255,255,255,0.04), transparent)`,
                  margin: isTall ? "20px 0" : "14px 0",
                }}
              />

              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <span
                  className="font-body font-semibold uppercase"
                  style={{
                    border: `1px solid ${tile.accent}25`,
                    color: `${tile.accent}99`,
                    background: `${tile.accent}08`,
                    borderRadius: "999px",
                    padding: "7px 20px",
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                  }}
                >
                  COMING SOON
                </span>

                <motion.div
                  className="flex items-center gap-1 font-body"
                  style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}
                  animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <span>Tap to preview</span>
                  <ArrowUpRight size={11} />
                </motion.div>
              </div>
            </>
          )}
        </div>

        {/* Bottom ambient glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-40%",
            left: "10%",
            right: "10%",
            height: "60%",
            background: `radial-gradient(ellipse at center, ${tile.accent}06 0%, transparent 70%)`,
            pointerEvents: "none",
            filter: "blur(20px)",
          }}
        />

        {/* Resize handle — only in edit mode */}
        {isEditMode && (
          <div
            onPointerDown={handleResizePointerDown}
            title="Drag to resize"
            className="absolute bottom-2 right-2 z-20 cursor-se-resize flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "rgba(255,215,0,0.18)",
              border: "1.5px solid rgba(255,215,0,0.55)",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 8 L8 2 M5 8 L8 5" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});

BentoCard.displayName = "BentoCard";

/* ─── Expanded Modal ─── */
function ExpandedTile({
  tile,
  onClose,
  subscriptions = [],
  trips = [],
  presets = [],
  insights = [],
  loading = false,
}: {
  tile: AppTile;
  onClose: () => void;
  subscriptions?: Subscription[];
  trips?: Trip[];
  presets?: BrainPreset[];
  insights?: BrainInsight[];
  loading?: boolean;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ padding: "40px" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full overflow-hidden flex flex-col"
        style={{
          maxWidth: "580px",
          maxHeight: "85vh",
          borderRadius: "28px",
          background: "rgba(18,18,20,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 80px ${tile.accent}08`,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        {/* Accent gradient top */}
        <div
          style={{
            height: "3px",
            background: `linear-gradient(90deg, transparent, ${tile.accent}, transparent)`,
            flexShrink: 0,
          }}
        />

        <div style={{ padding: "32px" }} className="overflow-y-auto flex-1 scrollbar-thin">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: `${tile.accent}10`,
                  border: `1px solid ${tile.accent}20`,
                }}
              >
                {tile.logo ? (
                  <Image
                    src={tile.logo}
                    alt={`${tile.name} logo`}
                    width={32}
                    height={32}
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <TrendingUp size={28} color={tile.accent} />
                )}
              </div>
              <div>
                <p
                  className="font-body font-semibold uppercase"
                  style={{
                    color: tile.accent,
                    fontSize: "10px",
                    letterSpacing: "0.16em",
                    marginBottom: "4px",
                  }}
                >
                  {tile.category}
                </p>
                <h2
                  className="font-heading font-bold text-white"
                  style={{ fontSize: "26px" }}
                >
                  {tile.name}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex items-center justify-center transition-colors duration-150 cursor-pointer"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          <p
            className="font-body font-light"
            style={{
              color: "#94A3B8",
              fontSize: "15px",
              lineHeight: 1.7,
              marginBottom: "28px",
            }}
          >
            {tile.description}
          </p>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: `linear-gradient(90deg, ${tile.accent}15, rgba(255,255,255,0.04), transparent)`,
              marginBottom: "24px",
            }}
          />

          {/* Current Data (replaces Planned Features) */}
          <p
            className="font-body font-semibold uppercase mb-4"
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "10px",
              letterSpacing: "0.14em",
            }}
          >
            Current Data
          </p>

          {tile.name === "TrackerSync" ? (
            <div className="space-y-3 mb-8">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255, 215, 0, 0.1)",
                      borderTopColor: tile.accent,
                      animation: "sb-spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.01]">
                  <p className="font-body text-xs text-white/40 text-center">
                    No active subscriptions tracked.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map((sub, i) => {
                    const subAccent = sub.color || tile.accent;
                    const renewalDate = new Date(sub.date + "T00:00:00");
                    const formattedDate = renewalDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, ease: EASE }}
                        className="flex items-center justify-between rounded-xl p-4"
                        style={{
                          background: `${tile.accent}06`,
                          border: `1px solid ${tile.accent}30`,
                          boxShadow: `0 0 18px ${tile.accent}12, inset 0 1px 0 ${tile.accent}12`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "4px",
                              background: subAccent,
                              boxShadow: `0 0 10px ${subAccent}66`,
                            }}
                          />
                          <div>
                            <p className="font-body text-sm font-bold text-white">
                              {sub.name}
                            </p>
                            <p className="font-body text-[11px] text-white/40 mt-0.5">
                              Renewal: {formattedDate}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-body text-sm font-extrabold" style={{ color: subAccent }}>
                            ${parseFloat(sub.amount).toFixed(2)}
                          </p>
                          <p className="font-body text-[10px] text-white/30 uppercase tracking-wider mt-0.5">
                            {sub.billingCycle} • Value: {sub.personalValue || 5}/10
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : tile.name === "TravelSync" ? (
            <div className="space-y-3 mb-8">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "2px solid rgba(242, 153, 74, 0.15)",
                      borderTopColor: tile.accent,
                      animation: "sb-spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : trips.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.01]">
                  <p className="font-body text-xs text-white/40 text-center">
                    No trips in TravelSync yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip, i) => {
                    const peopleText = `${trip.peopleCount} ${trip.peopleCount === 1 ? "traveler" : "travelers"}${trip.group ? ` · ${trip.group}` : ""}`;
                    return (
                      <motion.article
                        key={trip.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, ease: EASE }}
                        className="overflow-hidden rounded-2xl"
                        style={{
                          background: `${tile.accent}06`,
                          border: `1px solid ${tile.accent}30`,
                          boxShadow: `inset 0 1px 0 ${tile.accent}12`,
                        }}
                      >
                        <div
                          className="px-4 py-3"
                          style={{
                            background: `linear-gradient(90deg, ${tile.accent}14, transparent)`,
                            borderBottom: `1px solid ${tile.accent}24`,
                          }}
                        >
                          <p className="font-body text-sm font-bold text-white">{trip.name}</p>
                          {trip.budget ? (
                            <p className="font-body mt-0.5 text-[10px] uppercase tracking-wider text-white/35">
                              {trip.budget} budget
                            </p>
                          ) : null}
                        </div>
                        <div className="grid gap-2 p-3 sm:grid-cols-3">
                          <div className="rounded-xl p-3" style={{ background: `${tile.accent}05`, border: `1px solid ${tile.accent}24` }}>
                            <div className="mb-1.5 flex items-center gap-1.5 text-white/40">
                              <MapPin size={12} color={tile.accent} />
                              <span className="font-body text-[9px] uppercase tracking-wider">Location</span>
                            </div>
                            <p className="font-body text-xs font-semibold text-white/90">
                              {trip.location || "—"}
                            </p>
                          </div>
                          <div className="rounded-xl p-3" style={{ background: `${tile.accent}05`, border: `1px solid ${tile.accent}24` }}>
                            <div className="mb-1.5 flex items-center gap-1.5 text-white/40">
                              <Calendar size={12} color={tile.accent} />
                              <span className="font-body text-[9px] uppercase tracking-wider">Dates</span>
                            </div>
                            <p className="font-body text-xs font-semibold text-white/90">
                              {trip.dates || "—"}
                            </p>
                          </div>
                          <div className="rounded-xl p-3" style={{ background: `${tile.accent}05`, border: `1px solid ${tile.accent}24` }}>
                            <div className="mb-1.5 flex items-center gap-1.5 text-white/40">
                              <Users size={12} color={tile.accent} />
                              <span className="font-body text-[9px] uppercase tracking-wider">Travelers</span>
                            </div>
                            <p className="font-body text-xs font-semibold text-white/90">{peopleText}</p>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : tile.name === "BrainSync" ? (
            <div className="space-y-6 mb-8 text-left">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255, 215, 0, 0.1)",
                      borderTopColor: tile.accent,
                      animation: "sb-spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : (
                <>
                  {/* Focus Presets Section */}
                  <div>
                    <h3 className="font-body font-semibold text-xs text-white/40 uppercase tracking-wider mb-3">Focus Presets</h3>
                    {presets.length === 0 ? (
                      <p className="text-xs text-white/45 font-body">No presets configured.</p>
                    ) : (
                      <div className="space-y-2">
                        {presets.map((preset, i) => (
                          <motion.div
                            key={preset.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, ease: EASE }}
                            className="flex items-center justify-between rounded-xl p-4 bg-white/[0.02] border border-white/5"
                            style={{
                              boxShadow: `0 0 10px ${tile.accent}05`,
                            }}
                          >
                            <div>
                              <p className="font-body text-sm font-bold text-white">{preset.title}</p>
                              <p className="font-body text-[11px] text-white/40 mt-0.5">{preset.intent}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-body text-sm font-extrabold text-white">{preset.duration}m</p>
                              <p className="font-body text-[10px] text-white/40 mt-0.5" style={{ color: tile.accent }}>{preset.stats}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Focus Insights Section */}
                  <div className="mt-4">
                    <h3 className="font-body font-semibold text-xs text-white/40 uppercase tracking-wider mb-3">Completed Sessions</h3>
                    {insights.length === 0 ? (
                      <p className="text-xs text-white/45 font-body">No sessions completed yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {insights.map((insight, i) => {
                          const dateLabel = new Date(insight.completed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          return (
                            <motion.article
                              key={insight.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05, ease: EASE }}
                              className="overflow-hidden rounded-2xl border text-left"
                              style={{
                                background: `${tile.accent}03`,
                                borderColor: `${tile.accent}20`,
                                boxShadow: `inset 0 1px 0 ${tile.accent}08`,
                              }}
                            >
                              <div
                                className="px-4 py-2.5 flex justify-between items-center"
                                style={{
                                  background: `linear-gradient(90deg, ${tile.accent}0a, transparent)`,
                                  borderBottom: `1px solid ${tile.accent}15`,
                                }}
                              >
                                <p className="font-body text-sm font-bold text-white">{insight.title}</p>
                                <span className="font-body text-[10px] text-white/40">{dateLabel}</span>
                              </div>
                              <div className="grid gap-2 p-3 sm:grid-cols-3">
                                <div className="rounded-xl p-2.5 bg-white/[0.01] border border-white/5">
                                  <div className="mb-1 flex items-center gap-1 text-white/40">
                                    <span className="font-body text-[9px] uppercase tracking-wider">Duration</span>
                                  </div>
                                  <p className="font-body text-xs font-semibold text-white/90">
                                    {insight.duration} mins
                                  </p>
                                </div>
                                <div className="rounded-xl p-2.5 bg-white/[0.01] border border-white/5">
                                  <div className="mb-1 flex items-center gap-1 text-white/40">
                                    <span className="font-body text-[9px] uppercase tracking-wider">Focus Score</span>
                                  </div>
                                  <p className="font-body text-xs font-semibold text-white/90" style={{ color: tile.accent }}>
                                    {insight.analytics?.focusScore ?? 90}%
                                  </p>
                                </div>
                                <div className="rounded-xl p-2.5 bg-white/[0.01] border border-white/5">
                                  <div className="mb-1 flex items-center gap-1 text-white/40">
                                    <span className="font-body text-[9px] uppercase tracking-wider">Distractions</span>
                                  </div>
                                  <p className="font-body text-xs font-semibold text-white/90">
                                    {insight.analytics?.distractionsBlocked ?? 0} blocked
                                  </p>
                                </div>
                              </div>
                              <div className="px-3 pb-3 pt-0">
                                <p className="font-body text-[11px] text-white/50">
                                  <span className="text-white/30 font-semibold uppercase text-[9px] mr-1">Intent:</span>
                                  {insight.intent}
                                </p>
                              </div>
                            </motion.article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] mb-8">
              <span className="font-body text-xs text-white/40 font-semibold uppercase tracking-wider">
                COming soon
              </span>
            </div>
          )}

          {/* CTA */}
          <div
            className="flex items-center justify-center"
            style={{
              padding: "14px",
              borderRadius: "14px",
              background: `${tile.accent}08`,
              border: `1px solid ${tile.accent}18`,
            }}
          >
            <span
              className="font-body font-semibold uppercase text-center"
              style={{
                color: `${tile.accent}88`,
                fontSize: "11px",
                letterSpacing: "0.12em",
              }}
            >
              {tile.name === "TrackerSync" || tile.name === "TravelSync"
                ? "Ecosystem Live — Syncing Data"
                : "Launching Soon — Stay Tuned"}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Dashboard Page ─── */
export default function DashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expandedTile, setExpandedTile] = useState<AppTile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [presets, setPresets] = useState<BrainPreset[]>([]);
  const [insights, setInsights] = useState<BrainInsight[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settingsPopup, setSettingsPopup] = useState<{ open: boolean; tab: "settings" | "general" | "dashboard" }>({
    open: false,
    tab: "settings",
  });
  // Layout state
  const [tiles, setTiles] = useState<AppTile[]>(() => {
    const saved = loadLayout();
    return saved ? applyLayoutToTiles(DEFAULT_TILES, saved) : DEFAULT_TILES;
  });
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [editTiles, setEditTiles] = useState<AppTile[]>([]);
  // Pointer-based drag state
  const [dragState, setDragState] = useState<{
    fromIndex: number;
    mouseX: number;
    mouseY: number;
    cardW: number;
    cardH: number;
    offsetX: number;
    offsetY: number;
    tile: AppTile;
    snappedCol: number;
    snappedRow: number;
    isValidTarget: boolean;
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  function enterEditMode() {
    setEditTiles([...tiles]);
    setIsEditingLayout(true);
  }

  function cancelEdit() {
    setIsEditingLayout(false);
    setEditTiles([]);
    setDragState(null);
  }

  function confirmEdit() {
    const committed = editTiles;
    setTiles(committed);
    const layout: TileLayout[] = committed.map((t) => ({
      id: t.id,
      colSpan: t.colSpan,
      rowSpan: t.rowSpan,
      colStart: t.colStart ?? 1,
      rowStart: t.rowStart ?? 1,
    }));
    saveLayout(layout);
    setIsEditingLayout(false);
    setEditTiles([]);
    setDragState(null);
  }

  function resetLayout() {
    localStorage.removeItem(LAYOUT_KEY);
    setTiles(DEFAULT_TILES);
    setIsEditingLayout(false);
    setEditTiles([]);
    setDragState(null);
  }

  function handleCardPointerDown(index: number, e: React.PointerEvent<HTMLElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const t = editTiles[index];
    setDragState({
      fromIndex: index,
      mouseX: e.clientX,
      mouseY: e.clientY,
      cardW: rect.width,
      cardH: rect.height,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      tile: t,
      snappedCol: t.colStart ?? 1,
      snappedRow: t.rowStart ?? 1,
      isValidTarget: true,
    });
  }

  // Global pointer move/up for drag
  useEffect(() => {
    if (!dragState) return;

    function onMove(e: PointerEvent) {
      if (!dragState) return;

      const gridEl = gridRef.current;
      if (!gridEl) return;
      const gridRect = gridEl.getBoundingClientRect();

      // Top-left of the dragged card relative to the grid container
      const cardLeft = e.clientX - dragState.offsetX - gridRect.left;
      const cardTop = e.clientY - dragState.offsetY - gridRect.top;

      // Calculate dynamic grid column width
      const cellW = (gridRect.width - 16 * 3) / 4;
      const cellWAndGap = cellW + 16;
      const cellHAndGap = 190 + 16;

      const colSpan = dragState.tile.colSpan;

      // Snapped target cell coordinates
      const snappedCol = Math.max(1, Math.min(4 - colSpan + 1, Math.round(cardLeft / cellWAndGap) + 1));
      const snappedRow = Math.max(1, Math.round(cardTop / cellHAndGap) + 1);

      // Verify if target position is valid (either empty, or a valid single-card swap)
      const arr = [...editTiles];
      const fi = dragState.fromIndex;
      const draggedCard = arr[fi];

      const targetCard = { colStart: snappedCol, rowStart: snappedRow, colSpan: draggedCard.colSpan, rowSpan: draggedCard.rowSpan };

      const overlappingIndices = arr
        .map((t, idx) => ({ ...t, idx }))
        .filter(
          ({ idx, colStart, rowStart, colSpan: cSpan, rowSpan: rSpan }) =>
            idx !== fi &&
            overlaps(
              targetCard,
              { colStart: colStart ?? 1, rowStart: rowStart ?? 1, colSpan: cSpan, rowSpan: rSpan }
            )
        );

      let isValid = false;
      if (overlappingIndices.length === 0) {
        isValid = true;
      } else if (overlappingIndices.length === 1) {
        const targetIndex = overlappingIndices[0].idx;
        const targetCardObj = arr[targetIndex];
        const sourceCol = draggedCard.colStart ?? 1;
        const sourceRow = draggedCard.rowStart ?? 1;

        const tempArr = [...arr];
        tempArr[fi] = { ...draggedCard, colStart: snappedCol, rowStart: snappedRow };
        tempArr[targetIndex] = { ...targetCardObj, colStart: sourceCol, rowStart: sourceRow };

        if (isLayoutValid(tempArr)) {
          isValid = true;
        }
      }

      setDragState((prev) =>
        prev
          ? {
            ...prev,
            mouseX: e.clientX,
            mouseY: e.clientY,
            snappedCol,
            snappedRow,
            isValidTarget: isValid,
          }
          : null
      );
    }

    function onUp() {
      if (!dragState) return;

      if (dragState.isValidTarget) {
        const targetCol = dragState.snappedCol;
        const targetRow = dragState.snappedRow;
        const fi = dragState.fromIndex;

        setEditTiles((prev) => {
          const arr = [...prev];
          const dragged = { ...arr[fi], colStart: targetCol, rowStart: targetRow };

          // Find if there is any card at the target position to swap with
          const occupiedIndex = arr.findIndex(
            (t, idx) =>
              idx !== fi &&
              overlaps(
                { colStart: targetCol, rowStart: targetRow, colSpan: dragged.colSpan, rowSpan: dragged.rowSpan },
                { colStart: t.colStart ?? 1, rowStart: t.rowStart ?? 1, colSpan: t.colSpan, rowSpan: t.rowSpan }
              )
          );

          if (occupiedIndex !== -1) {
            // Swap: the occupied card gets the dragged card's starting position
            const sourceCol = arr[fi].colStart ?? 1;
            const sourceRow = arr[fi].rowStart ?? 1;
            arr[occupiedIndex] = { ...arr[occupiedIndex], colStart: sourceCol, rowStart: sourceRow };
          }

          arr[fi] = dragged;
          return arr;
        });
      }

      setDragState(null);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragState, editTiles]);

  function handleResizeCommit(index: number, colSpan: number, rowSpan: number) {
    setEditTiles((prev) => {
      const arr = prev.map((t, i) => (i === index ? { ...t, colSpan, rowSpan } : t));
      if (isLayoutValid(arr)) {
        return arr;
      }
      return prev;
    });
  }

  const fetchDashboardData = useCallback(() => {
    const storedToken = localStorage.getItem("subsync_token");
    if (!storedToken) return;
    try {
      const payload = JSON.parse(atob(storedToken));
      const accountId = payload.accountId;
      if (!accountId) {
        setLoadingSubs(false);
        return;
      }
      setLoadingSubs(true);
      Promise.all([
        fetch(`/api/subscriptions?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/trips?userId=${accountId}`).then((res) => res.json()),
        fetch(`/api/brainsync?userId=${accountId}`).then((res) => res.json()),
      ])
        .then(([subsData, tripsData, brainData]) => {
          if (subsData.ok && Array.isArray(subsData.subscriptions)) {
            setSubscriptions(subsData.subscriptions);
          }
          if (tripsData.ok && Array.isArray(tripsData.trips)) {
            setTrips(tripsData.trips);
          }
          if (brainData.ok && Array.isArray(brainData.presets)) {
            setPresets(brainData.presets);
          }
          if (brainData.ok && Array.isArray(brainData.insights)) {
            setInsights(brainData.insights);
          }
        })
        .catch((err) => console.error("Error fetching dashboard data:", err))
        .finally(() => setLoadingSubs(false));
    } catch (e) {
      console.error("Error decoding token:", e);
      setLoadingSubs(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("subsync_token");
    if (!storedToken) {
      router.replace("/");
      return;
    }
    try {
      const payload = JSON.parse(atob(storedToken));
      setUsername(payload.displayName || payload.username || "");
    } catch (e) {
      console.error("Error decoding token in dashboard:", e);
    }
    setAuthed(true);
    fetchDashboardData();
  }, [router, fetchDashboardData]);

  // Lock body scroll when expanded
  useEffect(() => {
    if (expandedTile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [expandedTile]);

  function handleLogout() {
    setIsTransitioning(true);
    localStorage.removeItem("subsync_token");
    window.dispatchEvent(new Event("storage"));
    setTimeout(() => {
      window.location.replace("/");
    }, 850);
  }

  if (!authed) return null;

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      <motion.div
        animate={
          isTransitioning
            ? { opacity: 0, scale: 0.97, filter: "blur(8px)" }
            : { opacity: 1, scale: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 0.8, ease: EASE }}
      >
        {/* Nav Bar */}
        <nav
          className="sticky top-0 z-50 flex h-16 items-center justify-between"
          style={{
            background: "rgba(10,10,10,0.8)",
            padding: "0 40px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Open navigation sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <Link
              href="/"
              className="font-heading text-[22px] font-black tracking-tight"
              style={{ color: "#FFD700" }}
            >
              SubSync
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-body text-sm transition-colors duration-150 hover:text-white"
              style={{ color: "#94A3B8" }}
            >
              ← Home
            </Link>
            <button
              onClick={handleLogout}
              className="font-body rounded-xl px-5 py-2 text-sm text-white transition-all duration-200 hover:text-red-400"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Page Header */}
        <div className="flex items-end justify-between" style={{ padding: "56px 40px 36px" }}>
          <div>
            <motion.p
              className="font-body font-semibold uppercase mb-3"
              style={{ color: "#FFD700", fontSize: "10px", letterSpacing: "0.16em" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
            >
              YOUR SYNC DASHBOARD
            </motion.p>
            <motion.p
              className="font-body font-semibold uppercase mb-3"
              style={{ color: "#94A3B8", fontSize: "11px", letterSpacing: "0.14em" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.06 }}
            >
              Connected, Simplified, Synced.
            </motion.p>
            <motion.h1
              className="font-heading font-bold text-white mb-3"
              style={{ fontSize: "38px", letterSpacing: "-0.025em" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
            >
              Welcome {username}.
            </motion.h1>
            <motion.p
              className="font-body text-[15px] font-light"
              style={{ color: "#94A3B8", lineHeight: 1.75 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
            >
              Everything synced. All in one place.
            </motion.p>
          </div>

          <motion.button
            onClick={fetchDashboardData}
            disabled={loadingSubs}
            className="font-body font-semibold flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
            style={{
              fontSize: "13px",
              color: loadingSubs ? "#FFD700" : "#94A3B8",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "9px 18px",
            }}
            whileHover={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.18)" }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
          >
            <RefreshCw
              size={13}
              style={{ animation: loadingSubs ? "sb-spin 0.8s linear infinite" : "none" }}
            />
            Refresh
          </motion.button>
        </div>

        {/* Bento Grid */}
        <div style={{ padding: "0 40px 60px" }}>
          <AnimatePresence>
            {isEditingLayout && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-center gap-3 px-1"
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-body text-xs font-semibold"
                  style={{
                    background: "rgba(255,215,0,0.08)",
                    border: "1px solid rgba(255,215,0,0.25)",
                    color: "#FFD700",
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
                  Edit Mode — drag to reorder · resize with corner handle
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={gridRef}
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
              gridAutoRows: "190px",
              position: "relative",
              minHeight: isEditingLayout ? "1000px" : "auto",
            }}
          >
            {(isEditingLayout ? editTiles : tiles).map((tile, i) => {
              const isDragging = dragState !== null && dragState.tile.id === tile.id;
              return (
                <BentoCard
                  key={tile.id}
                  tile={tile}
                  index={i}
                  onExpand={() => !isEditingLayout && setExpandedTile(tile)}
                  subscriptions={subscriptions}
                  trips={trips}
                  presets={presets}
                  insights={insights}
                  loading={loadingSubs}
                  isEditMode={isEditingLayout}
                  isBeingDragged={isDragging}
                  onResizeCommit={handleResizeCommit}
                  onPointerDownDrag={(idx, e) => handleCardPointerDown(i, e)}
                />
              );
            })}

            {/* Real-time snapped target placeholder */}
            {dragState && (
              <motion.div
                layout
                className="absolute border-2 border-dashed pointer-events-none"
                style={{
                  gridColumn: `${dragState.snappedCol} / span ${dragState.tile.colSpan}`,
                  gridRow: `${dragState.snappedRow} / span ${dragState.tile.rowSpan}`,
                  minHeight: dragState.tile.rowSpan === 2 ? "396px" : "190px",
                  borderRadius: 24,
                  zIndex: 10,
                  borderColor: dragState.isValidTarget ? "rgba(255, 215, 0, 0.45)" : "rgba(239, 68, 68, 0.45)",
                  backgroundColor: dragState.isValidTarget ? "rgba(255, 215, 0, 0.04)" : "rgba(239, 68, 68, 0.04)",
                  transition: "border-color 0.15s ease, background-color 0.15s ease",
                }}
              />
            )}
          </div>

          {/* Drag ghost — follows the cursor (Portal-rendered to avoid parent transforms) */}
          {dragState && typeof document !== "undefined" && createPortal(
            <div
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: dragState.cardW,
                height: dragState.cardH,
                zIndex: 9999,
                pointerEvents: "none",
                borderRadius: 24,
                overflow: "hidden",
                opacity: 0.88,
                transform: `translate3d(${dragState.mouseX - dragState.offsetX}px, ${dragState.mouseY - dragState.offsetY}px, 0) rotate(2deg) scale(1.04)`,
                boxShadow: "0 28px 60px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,215,0,0.4)",
                background: `linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,255,255,0.02))`,
                border: `2px solid ${dragState.isValidTarget ? "rgba(255,215,0,0.5)" : "rgba(239,68,68,0.5)"}`,
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Ghost card mini header */}
              <div
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${dragState.tile.accent}, transparent)`,
                }}
              />
              <div style={{ padding: "20px 22px" }}>
                <p className="font-body text-[10px] font-bold uppercase tracking-widest" style={{ color: dragState.tile.accent }}>
                  {dragState.tile.category}
                </p>
                <p className="font-heading text-xl font-black text-white mt-1">{dragState.tile.name}</p>
              </div>
              {/* Grab indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  style={{
                    background: dragState.isValidTarget ? "rgba(255,215,0,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${dragState.isValidTarget ? "rgba(255,215,0,0.25)" : "rgba(239,68,68,0.25)"}`,
                    borderRadius: 999,
                    padding: "6px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: dragState.isValidTarget ? "rgba(255,215,0,0.8)" : "rgba(239,68,68,0.8)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {dragState.isValidTarget ? "Moving…" : "Blocked"}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Expanded Modal */}
        <AnimatePresence>
          {expandedTile && (
            <ExpandedTile
              tile={expandedTile}
              onClose={() => setExpandedTile(null)}
              subscriptions={subscriptions}
              trips={trips}
              presets={presets}
              insights={insights}
              loading={loadingSubs}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenSettings={(tab) => {
            setSettingsPopup({ open: true, tab });
            setIsSidebarOpen(false);
          }}
        />

        {/* Settings Popup Modal */}
        <AnimatePresence>
          {settingsPopup.open && (
            <SettingsPopup
              initialTab={settingsPopup.tab}
              onClose={() => setSettingsPopup({ open: false, tab: "settings" })}
              onEnterEditMode={enterEditMode}
              onResetLayout={resetLayout}
            />
          )}
        </AnimatePresence>

        {/* Edit Mode Floating Control Bar */}
        <AnimatePresence>
          {isEditingLayout && (
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3"
              style={{
                background: "rgba(12,12,14,0.92)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                padding: "12px 20px",
                backdropFilter: "blur(24px)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.06)",
              }}
            >
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/8 border border-white/10 transition cursor-pointer"
              >
                <RotateCcw size={13} /> Cancel
              </button>

              <div className="h-5 w-px bg-white/10" />

              <button
                onClick={confirmEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#FFD700] hover:bg-[#ffe033] text-black font-bold rounded-xl text-xs transition cursor-pointer"
              >
                <Check size={13} /> Save Layout
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Responsive override */}
        <style>{`
        @keyframes sb-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr !important;
            grid-auto-rows: auto !important;
          }
          .grid > * {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
            min-height: 200px !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .grid > * {
            min-height: 200px !important;
          }
        }
      `}</style>
      </motion.div>
    </div>
  );
}
