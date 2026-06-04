"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Mail, Calendar, Briefcase, Shield, ArrowLeft, Home, LogOut, Loader2, Landmark } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  account_type: "personal" | "business";
  business_role: string | null;
  organization_name: string | null;
  role: "user" | "admin";
  created_at: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: number) => {
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      const data = await res.json();
      if (data.ok && data.profile) {
        setProfile(data.profile);
      } else {
        setError(data.error || "Failed to load profile.");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("An error occurred while loading profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("subsync_token");
    if (!token) {
      router.replace("/");
      return;
    }
    try {
      const payload = JSON.parse(atob(token));
      if (payload.accountId) {
        fetchProfile(payload.accountId);
      } else {
        setError("Invalid session.");
        setLoading(false);
      }
    } catch (e) {
      console.error("Failed to decode token:", e);
      setError("Invalid session token.");
      setLoading(false);
    }
  }, [router, fetchProfile]);

  function handleLogout() {
    localStorage.removeItem("subsync_token");
    window.dispatchEvent(new Event("storage"));
    router.replace("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#FFD700]" size={36} />
          <p className="font-body text-sm text-white/60">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Top Navbar */}
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
            href="/dashboard"
            className="font-body text-sm text-white/60 transition-colors duration-150 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <Link
            href="/"
            className="font-body text-sm text-white/60 transition-colors duration-150 hover:text-white flex items-center gap-1"
          >
            <Home size={14} /> Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(255, 214, 10, 0.04) 0%, transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="w-full max-w-xl relative z-10"
        >
          {error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <p className="text-red-400 font-body mb-4">{error}</p>
              <button
                onClick={handleLogout}
                className="font-body bg-red-500/20 text-red-200 border border-red-500/30 px-6 py-2 rounded-xl text-sm hover:bg-red-500/30 transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            profile && (
              <div
                className="rounded-3xl p-8 relative overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
              >
                {/* Accent top gradient */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, transparent, #FFD700, transparent)",
                  }}
                />

                {/* Header User Card */}
                <div className="flex items-center gap-6 mb-8">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD700]/20 text-[#FFD700] relative"
                    style={{
                      background: "rgba(255, 215, 0, 0.05)",
                      boxShadow: "0 0 16px rgba(255, 215, 0, 0.05)",
                    }}
                  >
                    <User size={30} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading font-black text-2xl tracking-tight text-white">
                        {profile.username}
                      </h2>
                      <span
                        className="font-body text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          border: profile.account_type === "business" ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,215,0,0.3)",
                          color: profile.account_type === "business" ? "#60A5FA" : "#FFD700",
                          background: profile.account_type === "business" ? "rgba(59,130,246,0.06)" : "rgba(255,215,0,0.06)",
                        }}
                      >
                        {profile.account_type}
                      </span>
                    </div>
                    <p className="font-body text-xs text-white/40 mt-1">
                      Account ID: <span className="text-white/60 font-mono">{profile.id}</span>
                    </p>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3 text-white/50">
                      <Mail size={16} />
                      <span className="font-body text-sm">Email Address</span>
                    </div>
                    <span className="font-body text-sm text-white/80">{profile.email}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3 text-white/50">
                      <Shield size={16} />
                      <span className="font-body text-sm">Access Role</span>
                    </div>
                    <span className="font-body text-sm text-[#FFD700] uppercase tracking-wide font-semibold">
                      {profile.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3 text-white/50">
                      <Calendar size={16} />
                      <span className="font-body text-sm">Member Since</span>
                    </div>
                    <span className="font-body text-sm text-white/80">
                      {new Date(profile.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Business Information */}
                  {profile.account_type === "business" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-[#3B82F6]/10 space-y-4"
                    >
                      <p className="font-body text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
                        Business Workspace
                      </p>
                      
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3 text-white/50">
                          <Landmark size={16} />
                          <span className="font-body text-sm">Organization</span>
                        </div>
                        <span className="font-body text-sm text-white/80">
                          {profile.organization_name || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3 text-white/50">
                          <Briefcase size={16} />
                          <span className="font-body text-sm">Job Title / Role</span>
                        </div>
                        <span className="font-body text-sm text-white/80 capitalize">
                          {profile.business_role || "Employee"}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <Link
                    href="/dashboard"
                    className="font-body font-semibold text-black bg-[#FFD700] hover:bg-[#ffe033] px-6 py-3 rounded-xl text-sm transition flex items-center gap-2"
                  >
                    Go to Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="font-body text-red-400 hover:text-red-300 px-4 py-2 rounded-xl text-sm transition flex items-center gap-2 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              </div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
}
