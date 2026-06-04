"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Mail, Calendar, Briefcase, Shield, ArrowLeft, Home, LogOut, Loader2, Landmark, CheckCircle, Copy, Check, Info, Trash2, Users } from "lucide-react";

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
  const [copied, setCopied] = useState(false);
  const [syncInput, setSyncInput] = useState("");
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  function handleCopySyncCode(syncCode: string) {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSyncClick() {
    setSyncMsg("Syncing is coming soon — stay tuned!");
    setTimeout(() => setSyncMsg(null), 3000);
  }

  async function handleDeleteAccount() {
    try {
      const res = await fetch("/api/profile/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile?.id }),
      });
      if (res.ok) {
        localStorage.removeItem("subsync_token");
        router.replace("/");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
    }
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
      <div className="flex-1 relative overflow-hidden">
        {/* Ambient radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[180px]"
          style={{
            background: "radial-gradient(circle, rgba(255, 214, 10, 0.04) 0%, transparent 70%)",
          }}
        />
        
        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: 0.03,
          }}
        />

        <div className="relative z-10 p-8 lg:p-12">
          {error ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center max-w-md">
                <p className="text-red-400 font-body mb-4">{error}</p>
                <button
                  onClick={handleLogout}
                  className="font-body bg-red-500/20 text-red-200 border border-red-500/30 px-6 py-2 rounded-xl text-sm hover:bg-red-500/30 transition"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            profile && (
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[35%_65%] gap-8">
                {/* Left Column - Identity Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.1 * 0 }}
                  className="lg:sticky lg:top-24 lg:self-start"
                >
                  <div
                    className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 relative overflow-hidden"
                  >
                    {/* Gold top-bar accent */}
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

                    {/* Avatar area */}
                    <div className="flex flex-col items-center mb-6">
                      <div
                        className="h-24 w-24 rounded-full flex items-center justify-center border-2 border-[#FFD700]/30 animate-pulse relative"
                        style={{
                          background: "rgba(255, 215, 0, 0.08)",
                        }}
                      >
                        <span className="font-black text-4xl" style={{ color: "#FFD700" }}>
                          {profile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <h2 className="font-heading font-black text-2xl tracking-tight text-white mb-2">
                          {profile.username}
                        </h2>
                        <span
                          className="font-body text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full inline-block"
                          style={{
                            border: profile.account_type === "business" ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,215,0,0.3)",
                            color: profile.account_type === "business" ? "#60A5FA" : "#FFD700",
                            background: profile.account_type === "business" ? "rgba(59,130,246,0.06)" : "rgba(255,215,0,0.06)",
                          }}
                        >
                          {profile.account_type}
                        </span>
                      </div>
                      
                      <p className="font-body text-xs text-white/40 mt-2">
                        Account ID: <span className="text-white/60 font-mono">{profile.id}</span>
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/[0.06] my-6" />

                    {/* Info rows */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-white/40" />
                        <div className="flex-1">
                          <p className="font-body text-[10px] text-white/40 uppercase tracking-wider">Email</p>
                          <p className="font-body text-sm text-white/80">{profile.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Shield size={16} className="text-white/40" />
                        <div className="flex-1">
                          <p className="font-body text-[10px] text-white/40 uppercase tracking-wider">Access Role</p>
                          <p className="font-body text-sm" style={{ color: "#FFD700" }}>{profile.role.toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-white/40" />
                        <div className="flex-1">
                          <p className="font-body text-[10px] text-white/40 uppercase tracking-wider">Member Since</p>
                          <p className="font-body text-sm text-white/80">
                            {new Date(profile.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Business Information */}
                      {profile.account_type === "business" && (
                        <div
                          className="mt-4 pt-4 border-t border-[#3B82F6]/10 space-y-4 rounded-xl p-4"
                          style={{ background: "rgba(59,130,246,0.03)" }}
                        >
                          <p className="font-body text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider mb-3">
                            Business Workspace
                          </p>
                          
                          <div className="flex items-center gap-3">
                            <Landmark size={16} className="text-white/40" />
                            <div className="flex-1">
                              <p className="font-body text-[10px] text-white/40 uppercase tracking-wider">Organization</p>
                              <p className="font-body text-sm text-white/80">{profile.organization_name || "N/A"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Briefcase size={16} className="text-white/40" />
                            <div className="flex-1">
                              <p className="font-body text-[10px] text-white/40 uppercase tracking-wider">Job Title</p>
                              <p className="font-body text-sm text-white/80 capitalize">{profile.business_role || "Employee"}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 space-y-3">
                      <Link
                        href="/dashboard"
                        className="w-full font-body font-semibold text-black bg-[#FFD700] hover:bg-[#ffe033] px-6 py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
                      >
                        Go to Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full font-body text-red-400 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/5 px-4 py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 border border-transparent"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column - Content Panels */}
                <div className="space-y-6">
                  {/* Panel A - Account Overview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.1 * 1 }}
                    className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full" style={{ background: "#FFD700" }} />
                      <h3 className="font-heading font-bold text-lg text-white">Account Overview</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Account Type */}
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {profile.account_type === "business" ? <Briefcase size={18} className="text-white/40" /> : <User size={18} className="text-white/40" />}
                          <p className="font-body text-[10px] text-white/40 uppercase tracking-wider">Account Type</p>
                        </div>
                        <p className="font-mono font-bold text-xl" style={{ color: "#FFD700" }}>
                          {profile.account_type.toUpperCase()}
                        </p>
                      </div>

                      {/* Access Level */}
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield size={18} className="text-white/40" />
                          <p className="font-body text-[10px] text-white/40 uppercase tracking-wider">Access Level</p>
                        </div>
                        <p className="font-mono font-bold text-xl" style={{ color: "#FFD700" }}>
                          {profile.role.toUpperCase()}
                        </p>
                      </div>

                      {/* Account Status */}
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={18} className="text-white/40" />
                          <p className="font-body text-[10px] text-white/40 uppercase tracking-wider">Status</p>
                        </div>
                        <p className="font-mono font-bold text-xl" style={{ color: "#FFD700" }}>
                          ACTIVE
                        </p>
                      </div>

                      {/* Days as Member */}
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={18} className="text-white/40" />
                          <p className="font-body text-[10px] text-white/40 uppercase tracking-wider">Days with SubSync</p>
                        </div>
                        <p className="font-mono font-bold text-xl" style={{ color: "#FFD700" }}>
                          {Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Panel B - Sync with People */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.1 * 2 }}
                    className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={20} style={{ color: "#FFD700" }} />
                      <h3 className="font-heading font-bold text-lg text-white">Sync with People</h3>
                    </div>
                    <p className="font-body text-sm text-white/50 mb-6 leading-relaxed">
                      Connect with others in the SubSync ecosystem. Share subscriptions, discover what people are tracking, and collaborate on spending goals.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Your Sync Code */}
                      <div>
                        <p className="font-body text-[10px] text-white/40 uppercase tracking-wider mb-3">Your Sync Code</p>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 font-mono font-bold text-sm px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
                          >
                            {"SYNC-" + btoa(String(profile.id)).replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6)}
                          </div>
                          <button
                            onClick={() => handleCopySyncCode("SYNC-" + btoa(String(profile.id)).replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6))}
                            className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition"
                          >
                            {copied ? <Check size={18} style={{ color: "#FFD700" }} /> : <Copy size={18} className="text-white/60" />}
                          </button>
                        </div>
                        <p className="font-body text-[10px] text-white/30 mt-2">Share this code with friends to connect.</p>
                      </div>

                      {/* Find Someone */}
                      <div>
                        <p className="font-body text-[10px] text-white/40 uppercase tracking-wider mb-3">Find Someone</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter their Sync Code"
                            value={syncInput}
                            onChange={(e) => setSyncInput(e.target.value)}
                            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFD700]/30"
                          />
                          <button
                            onClick={handleSyncClick}
                            className="px-4 py-3 rounded-xl font-body font-semibold text-sm transition"
                            style={{ background: "#FFD700", color: "#0A0A0A" }}
                          >
                            Sync
                          </button>
                        </div>
                        {syncMsg && (
                          <div className="flex items-center gap-2 mt-2 p-2 rounded-lg" style={{ background: "rgba(255, 215, 0, 0.08)" }}>
                            <Info size={14} style={{ color: "#FFD700" }} />
                            <p className="font-body text-[10px]" style={{ color: "#FFD700" }}>{syncMsg}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Suggested People */}
                    {/* Coming soon */}
                    <div className="border-t border-white/[0.06] pt-6">
                      <p className="font-body text-[10px] text-white/30 uppercase tracking-wider mb-4">Suggested People</p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {[
                          { initial: "A", username: "apex_user" },
                          { initial: "B", username: "bytewise" },
                          { initial: "C", username: "cloudnomad" },
                        ].map((user, i) => (
                          <div
                            key={i}
                            className="flex-shrink-0 rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 flex items-center gap-3"
                          >
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                              style={{ background: "rgba(255, 215, 0, 0.08)", color: "#FFD700" }}
                            >
                              {user.initial}
                            </div>
                            <div>
                              <p className="font-body text-sm font-semibold text-white">{user.username}</p>
                              <button
                                disabled
                                className="font-body text-[10px] px-2 py-1 rounded-lg mt-1 transition"
                                style={{ color: "#FFD700", border: "1px solid rgba(255,215,0,0.2)", background: "rgba(255,215,0,0.05)", opacity: 0.5 }}
                              >
                                Sync →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Panel C - Danger Zone */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.1 * 3 }}
                    className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <h3 className="font-heading font-bold text-lg text-white">Danger Zone</h3>
                    </div>

                    {!confirmDelete ? (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="w-full font-body text-red-400 hover:text-red-300 hover:bg-red-500/05 px-4 py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 border border-red-500/20"
                      >
                        <Trash2 size={16} /> Delete Account
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <p className="font-body text-sm text-red-400">
                          This action is permanent and cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 font-body text-white/60 hover:text-white px-4 py-2 rounded-xl text-sm transition border border-white/[0.08] hover:bg-white/[0.04]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            className="flex-1 font-body text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 px-4 py-2 rounded-xl text-sm transition"
                          >
                            Yes, Delete My Account
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
