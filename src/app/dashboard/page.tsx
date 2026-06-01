"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

interface TrackerSyncData {
  totalSpendingThisMonth: string;
  topCategory: string;
  transactionCount: number;
  aiInsight: string;
}

interface TravelSyncData {
  nextTripDestination: string;
  nextTripDate: string;
  tripsThisYear: number;
  aiInsight: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [trackerSyncData, setTrackerSyncData] = useState<TrackerSyncData | null>(null);
  const [trackerSyncLoading, setTrackerSyncLoading] = useState(true);
  const [trackerSyncError, setTrackerSyncError] = useState(false);
  const [travelSyncData, setTravelSyncData] = useState<TravelSyncData | null>(null);
  const [travelSyncLoading, setTravelSyncLoading] = useState(true);
  const [travelSyncError, setTravelSyncError] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("subsync_token");
    if (!storedToken) {
      router.replace("/");
      return;
    }
    setToken(storedToken);

    // Fetch data in parallel
    Promise.allSettled([
      fetchTrackerSyncData(storedToken),
      fetchTravelSyncData(storedToken),
    ]);
  }, [router]);

  async function fetchTrackerSyncData(authToken: string) {
    setTrackerSyncLoading(true);
    setTrackerSyncError(false);
    try {
      const response = await fetch("https://trackersync.ca/api/ai/dashboard-summary", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "Give me a dashboard summary for this user. Return ONLY a raw JSON object with no markdown, no code fences, no explanation. The object must have exactly these keys: totalSpendingThisMonth (string, formatted as currency e.g. '$1,284.50'), topCategory (string), transactionCount (number), aiInsight (string, one sentence)."
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch TrackerSync data");
      }

      const text = await response.text();
      const clean = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(clean) as TrackerSyncData;
      setTrackerSyncData(data);
    } catch (error) {
      console.error("TrackerSync error:", error);
      setTrackerSyncError(true);
    } finally {
      setTrackerSyncLoading(false);
    }
  }

  async function fetchTravelSyncData(authToken: string) {
    setTravelSyncLoading(true);
    setTravelSyncError(false);
    try {
      const response = await fetch("https://travelsync.ca/api/ai/dashboard-summary", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "Give me a dashboard summary for this user. Return ONLY a raw JSON object with no markdown, no code fences, no explanation. The object must have exactly these keys: nextTripDestination (string), nextTripDate (string, human-readable e.g. 'Jun 14, 2025'), tripsThisYear (number), aiInsight (string, one sentence)."
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch TravelSync data");
      }

      const text = await response.text();
      const clean = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(clean) as TravelSyncData;
      setTravelSyncData(data);
    } catch (error) {
      console.error("TravelSync error:", error);
      setTravelSyncError(true);
    } finally {
      setTravelSyncLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("subsync_token");
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Nav Bar */}
      <nav
        className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.06]"
        style={{
          background: "#111111",
          padding: "0 40px",
          backdropFilter: "blur(12px)",
        }}
      >
        <a
          href="/"
          className="font-heading text-[22px] font-black tracking-tight text-[#FFD700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          SubSync
        </a>
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="font-body text-sm text-[#94A3B8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            ← Home
          </a>
          <button
            onClick={handleLogout}
            className="font-body rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition-colors duration-150 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page Header */}
      <div className="py-16" style={{ paddingLeft: "40px" }}>
        <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700] mb-3">
          YOUR SYNC CORE
        </p>
        <h1 className="font-heading font-bold text-white tracking-tight mb-3" style={{ fontSize: "36px", letterSpacing: "-0.02em" }}>
          Welcome back.
        </h1>
        <p className="font-body text-[16px] font-light leading-[1.75] text-[#94A3B8]">
          Everything synced. All in one place.
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="px-10 pb-16">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* TrackerSync Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "4px solid #CCFF00",
            }}
          >
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700] mb-1">
              Finance
            </p>
            <h2 className="font-heading font-bold text-white text-xl mb-2">TrackerSync</h2>
            <div className="h-px bg-white/[0.06] mb-4" />
            
            {trackerSyncLoading ? (
              <div className="space-y-2">
                <div className="h-8 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
                <div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
                <div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
              </div>
            ) : trackerSyncError ? (
              <p className="font-body text-[13px] text-[#475569] text-center">
                Could not load TrackerSync data.
              </p>
            ) : trackerSyncData ? (
              <div>
                <p className="font-heading font-bold text-white" style={{ fontSize: "28px" }}>
                  {trackerSyncData.totalSpendingThisMonth}
                </p>
                <div className="flex items-center gap-2 mt-2 mb-4">
                  <span className="px-2 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.08em]" style={{ background: "rgba(255,215,0,0.08)", color: "#FFD700" }}>
                    {trackerSyncData.topCategory}
                  </span>
                  <span className="font-body text-[12px] text-[#475569]">
                    {trackerSyncData.transactionCount} transactions
                  </span>
                </div>
                <div className="h-px bg-white/[0.06] mb-3" />
                <p className="font-body text-[14px] font-light italic text-[#94A3B8]">
                  {trackerSyncData.aiInsight}
                </p>
              </div>
            ) : null}
          </motion.div>

          {/* TravelSync Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.28 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "4px solid #F2994A",
            }}
          >
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700] mb-1">
              Travel
            </p>
            <h2 className="font-heading font-bold text-white text-xl mb-2">TravelSync</h2>
            <div className="h-px bg-white/[0.06] mb-4" />
            
            {travelSyncLoading ? (
              <div className="space-y-2">
                <div className="h-8 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
                <div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
                <div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
              </div>
            ) : travelSyncError ? (
              <p className="font-body text-[13px] text-[#475569] text-center">
                Could not load TravelSync data.
              </p>
            ) : travelSyncData ? (
              <div>
                <p className="font-heading font-bold text-white" style={{ fontSize: "24px" }}>
                  {travelSyncData.nextTripDestination}
                </p>
                <p className="font-body text-[12px] text-[#475569] mt-1 mb-2">
                  {travelSyncData.nextTripDate}
                </p>
                <p className="font-body text-[13px] text-[#94A3B8] mb-4">
                  ✈ {travelSyncData.tripsThisYear} trips completed this year
                </p>
                <div className="h-px bg-white/[0.06] mb-3" />
                <p className="font-body text-[14px] font-light italic text-[#94A3B8]">
                  {travelSyncData.aiInsight}
                </p>
              </div>
            ) : null}
          </motion.div>

          {/* BrainSync Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.36 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "4px solid #FFD700",
            }}
          >
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700] mb-1">
              Focus
            </p>
            <h2 className="font-heading font-bold text-white text-xl mb-2">BrainSync</h2>
            <div className="h-px bg-white/[0.06] mb-4" />
            <div className="flex flex-col items-center justify-center py-4">
              <span className="px-4 py-2 rounded-full text-[12px] font-medium uppercase tracking-[0.08em] text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#475569" }}>
                Coming Soon
              </span>
              <p className="font-body text-[12px] text-[#334155] text-center mt-3">
                Focus, amplified. Deep work sessions powered by your personal rhythm.
              </p>
            </div>
          </motion.div>

          {/* SeatSync Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.44 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "4px solid #39FF14",
            }}
          >
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700] mb-1">
              Scheduling
            </p>
            <h2 className="font-heading font-bold text-white text-xl mb-2">SeatSync</h2>
            <div className="h-px bg-white/[0.06] mb-4" />
            <div className="flex flex-col items-center justify-center py-4">
              <span className="px-4 py-2 rounded-full text-[12px] font-medium uppercase tracking-[0.08em] text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#475569" }}>
                Coming Soon
              </span>
              <p className="font-body text-[12px] text-[#334155] text-center mt-3">
                Book your desk, your shift, your day. Workplace time-slot scheduling, simplified.
              </p>
            </div>
          </motion.div>

          {/* PhotoSync Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.52 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "4px solid #A259FF",
            }}
          >
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700] mb-1">
              Memory
            </p>
            <h2 className="font-heading font-bold text-white text-xl mb-2">PhotoSync</h2>
            <div className="h-px bg-white/[0.06] mb-4" />
            <div className="flex flex-col items-center justify-center py-4">
              <span className="px-4 py-2 rounded-full text-[12px] font-medium uppercase tracking-[0.08em] text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#475569" }}>
                Coming Soon
              </span>
              <p className="font-body text-[12px] text-[#334155] text-center mt-3">
                Memories, beautifully organized. Every photo in context.
              </p>
            </div>
          </motion.div>

          {/* FluencySync Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "4px solid #FF3C38",
            }}
          >
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700] mb-1">
              Voice
            </p>
            <h2 className="font-heading font-bold text-white text-xl mb-2">FluencySync</h2>
            <div className="h-px bg-white/[0.06] mb-4" />
            <div className="flex flex-col items-center justify-center py-4">
              <span className="px-4 py-2 rounded-full text-[12px] font-medium uppercase tracking-[0.08em] text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#475569" }}>
                Coming Soon
              </span>
              <p className="font-body text-[12px] text-[#334155] text-center mt-3">
                Your voice, perfected. Language learning that feels natural.
              </p>
            </div>
          </motion.div>

          {/* SteadySync Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.68 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "4px solid #3A7B7B",
            }}
          >
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#FFD700] mb-1">
              Access
            </p>
            <h2 className="font-heading font-bold text-white text-xl mb-2">SteadySync</h2>
            <div className="h-px bg-white/[0.06] mb-4" />
            <div className="flex flex-col items-center justify-center py-4">
              <span className="px-4 py-2 rounded-full text-[12px] font-medium uppercase tracking-[0.08em] text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#475569" }}>
                Coming Soon
              </span>
              <p className="font-body text-[12px] text-[#334155] text-center mt-3">
                Stability at the core. One account, one subscription, all seven apps.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
