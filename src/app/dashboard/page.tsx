"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, X, ArrowUpRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface AppTile {
  name: string;
  category: string;
  accent: string;
  logo: string | null;
  description: string;
  features: string[];
  colSpan: number;
  rowSpan: number;
}

const TILES: AppTile[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

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

/* ─── 3D Tilt Card ─── */
function BentoCard({
  tile,
  index,
  onExpand,
  subscriptions = [],
  loading = false,
}: {
  tile: AppTile;
  index: number;
  onExpand: () => void;
  subscriptions?: Subscription[];
  loading?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
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

  const isTall = tile.rowSpan === 2;
  const isWide = tile.colSpan === 2;

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

    return sorted.slice(0, 3);
  };

  const displaySubs = getSortedUpcoming();

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: EASE,
        delay: 0.12 + index * 0.06,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onExpand}
      className="relative cursor-pointer overflow-hidden"
      style={{
        gridColumn: `span ${tile.colSpan}`,
        gridRow: `span ${tile.rowSpan}`,
        perspective: "800px",
        minHeight: isTall ? "380px" : "190px",
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
          style={{ padding: isTall || isWide ? "28px" : "22px" }}
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
            <div className="flex flex-1 flex-col justify-between mt-4" style={{ minHeight: "180px" }}>
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
                <div className="flex flex-col gap-2 flex-1 justify-center">
                  {displaySubs.map((sub) => {
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
                        className="flex items-center justify-between rounded-xl transition-all duration-300 hover:bg-white/[0.04] group"
                        style={{
                          padding: "10px 14px",
                          background: "rgba(255, 255, 255, 0.02)",
                          border: `1px solid rgba(255, 255, 255, 0.05)`,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.01)`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "3px",
                              background: sub.color || tile.accent,
                              boxShadow: `0 0 8px ${sub.color || tile.accent}`,
                            }}
                          />
                          <div>
                            <p className="font-body text-[13px] font-bold text-white group-hover:text-[#FFD700] transition-colors">
                              {sub.name}
                            </p>
                            <p className="font-body text-[10px] text-white/40">
                              {formattedDate} • <span style={{ color: diffDays >= 0 ? "#FFD700" : "rgba(255, 100, 100, 0.6)" }}>{daysLabel}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-body text-[13px] font-bold" style={{ color: tile.accent }}>
                            ${parseFloat(sub.amount).toFixed(2)}
                          </p>
                          <p className="font-body text-[9px] text-white/30 uppercase tracking-wide">
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
                className="flex items-center gap-1 font-body justify-center mt-3"
                style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <span>Tap to preview</span>
                <ArrowUpRight size={11} />
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
      </motion.div>
    </motion.div>
  );
}

/* ─── Expanded Modal ─── */
function ExpandedTile({
  tile,
  onClose,
}: {
  tile: AppTile;
  onClose: () => void;
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
        className="relative z-10 w-full overflow-hidden"
        style={{
          maxWidth: "580px",
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
          }}
        />

        <div style={{ padding: "32px" }}>
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
              className="flex items-center justify-center transition-colors duration-150"
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

          {/* Features */}
          <p
            className="font-body font-semibold uppercase mb-4"
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "10px",
              letterSpacing: "0.14em",
            }}
          >
            PLANNED FEATURES
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {tile.features.map((feature, i) => (
              <motion.div
                key={feature}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06, ease: EASE }}
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: tile.accent,
                    opacity: 0.6,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-body"
                  style={{ color: "#CBD5E1", fontSize: "13px" }}
                >
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>

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
              className="font-body font-semibold uppercase"
              style={{
                color: `${tile.accent}88`,
                fontSize: "11px",
                letterSpacing: "0.12em",
              }}
            >
              Launching Soon — Stay Tuned
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expandedTile, setExpandedTile] = useState<AppTile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("subsync_token");
    if (!storedToken) {
      router.replace("/");
      return;
    }
    setAuthed(true);

    try {
      const payload = JSON.parse(atob(storedToken));
      const accountId = payload.accountId;
      if (accountId) {
        setLoadingSubs(true);
        fetch(`/api/subscriptions?userId=${accountId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.ok && Array.isArray(data.subscriptions)) {
              setSubscriptions(data.subscriptions);
            }
          })
          .catch((err) => console.error("Error fetching subscriptions:", err))
          .finally(() => setLoadingSubs(false));
      } else {
        setLoadingSubs(false);
      }
    } catch (e) {
      console.error("Error decoding token:", e);
      setLoadingSubs(false);
    }
  }, [router]);

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
    setTimeout(() => {
      router.replace("/");
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
        <Link
          href="/"
          className="font-heading text-[22px] font-black tracking-tight"
          style={{ color: "#FFD700" }}
        >
          SubSync
        </Link>
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
      <div style={{ padding: "56px 40px 36px" }}>
        <motion.p
          className="font-body font-semibold uppercase mb-3"
          style={{ color: "#FFD700", fontSize: "10px", letterSpacing: "0.16em" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        >
          YOUR SYNC CORE
        </motion.p>
        <motion.h1
          className="font-heading font-bold text-white mb-3"
          style={{ fontSize: "38px", letterSpacing: "-0.025em" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
        >
          Welcome back.
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

      {/* Bento Grid */}
      <div style={{ padding: "0 40px 60px" }}>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridAutoRows: "190px",
          }}
        >
          {TILES.map((tile, i) => (
            <BentoCard
              key={tile.name}
              tile={tile}
              index={i}
              onExpand={() => setExpandedTile(tile)}
              subscriptions={subscriptions}
              loading={loadingSubs}
            />
          ))}
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {expandedTile && (
          <ExpandedTile
            tile={expandedTile}
            onClose={() => setExpandedTile(null)}
          />
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
