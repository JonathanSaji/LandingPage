"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Navigation, AppWindow, Database, ScrollText, LogOut, Clock, MousePointer, Bot, Eye, EyeOff, Sun, Moon, Trash2, Layout, RefreshCw, AlertTriangle, ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { loadSettings, saveSettings, type SyncBotSettings } from "@/components/ui/syncbot-settings";

// Toggle Row
function Toggle({
  icon: Icon, label, description, checked, onChange,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3.5 py-3 border-b border-white/5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
        style={{
          background: checked ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.05)",
        }}
      >
        <Icon size={16} color={checked ? "#FFD700" : "rgba(255,255,255,0.35)"} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold"
          style={{ color: checked ? "#fff" : "rgba(255,255,255,0.55)" }}
        >
          {label}
        </p>
        <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{description}</p>
      </div>

      <button
        onClick={() => onChange(!checked)}
        className="w-10 h-6 rounded-full relative flex-shrink-0 transition-colors duration-250 cursor-pointer"
        style={{
          background: checked ? "#FFD700" : "rgba(255,255,255,0.12)",
        }}
      >
        <span
          className="w-4.5 h-4.5 rounded-full absolute top-[3px] transition-all duration-250"
          style={{
            left: checked ? "20px" : "3px",
            background: checked ? "#000" : "rgba(255,255,255,0.5)",
          }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"settings" | "general" | "dashboard">("settings");

  useEffect(() => {
    const tab = searchParams.get("tab") as "settings" | "general" | "dashboard" | null;
    if (tab && ["settings", "general", "dashboard"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Settings State
  const [s, setS] = useState<SyncBotSettings>(() => loadSettings());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // General Settings State
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Load theme setting
    const savedTheme = localStorage.getItem("subsync_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setThemeMode(savedTheme);
    }

    // Load user ID
    const token = localStorage.getItem("subsync_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token));
        if (payload.accountId) {
          setUserId(payload.accountId);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleThemeChange = (mode: "dark" | "light") => {
    setThemeMode(mode);
    localStorage.setItem("subsync_theme", mode);
    if (mode === "light") {
      document.documentElement.classList.add("light-mode-preview");
    } else {
      document.documentElement.classList.remove("light-mode-preview");
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    try {
      setDeleting(true);
      const res = await fetch("/api/profile/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.removeItem("subsync_token");
        window.dispatchEvent(new Event("storage"));
        router.replace("/");
      } else {
        alert(data.error || "Failed to delete account.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during account deletion.");
    } finally {
      setDeleting(false);
    }
  };

  const updateSetting = useCallback(<K extends keyof SyncBotSettings>(key: K, val: SyncBotSettings[K]) => {
    setS((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    await saveSettings(s);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const PERMISSIONS = [
    { key: "allowNavigation" as const, icon: Navigation, label: "Navigation", description: "Say 'Go to dashboard', 'Go home'" },
    { key: "allowOpenApps" as const, icon: AppWindow, label: "Open Apps", description: "Say 'Open TrackerSync', 'Open TravelSync'" },
    { key: "allowDataSummary" as const, icon: Database, label: "Summarize Data", description: "Say 'Summarize my subscriptions'" },
    { key: "allowScrollControl" as const, icon: ScrollText, label: "Scroll Control", description: "Say 'Scroll down', 'Back to top'" },
    { key: "allowAuthActions" as const, icon: LogOut, label: "Auth Actions", description: "Say 'Log me out', 'Open login'" },
    { key: "allowTimeDate" as const, icon: Clock, label: "Time & Date", description: "Say 'What time is it?', 'What day?'" },
    { key: "allowClickButtons" as const, icon: MousePointer, label: "Click by Voice", description: "Say 'Click sign up', 'Press submit'" },
    { key: "allowAI" as const, icon: Bot, label: "AI Responses", description: "Smart answers for open-ended questions" },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0E]">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0C0C0E]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 flex items-center justify-center text-[#FFD700]">
                <SettingsIcon size={16} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Settings</h1>
                <p className="text-xs text-white/40">Manage your SubSync preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-white/5 justify-center">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 text-sm font-semibold relative transition-colors ${
              activeTab === "general" ? "text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            General Settings
            {activeTab === "general" && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-3 text-sm font-semibold relative transition-colors ${
              activeTab === "dashboard" ? "text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            Dashboard Settings
            {activeTab === "dashboard" && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 text-sm font-semibold relative transition-colors ${
              activeTab === "settings" ? "text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            SyncBot Settings
            {activeTab === "settings" && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "settings" && (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl"
            >
              <div className="bg-[#121214] rounded-2xl border border-white/5 overflow-hidden">
                {/* Permissions list */}
                <div className="p-6 border-b border-white/5">
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-4">Permissions</p>
                  <div className="space-y-1">
                    {PERMISSIONS.map((p) => (
                      <Toggle
                        key={p.key}
                        icon={p.icon}
                        label={p.label}
                        description={p.description}
                        checked={s[p.key] as boolean}
                        onChange={(v) => updateSetting(p.key, v)}
                      />
                    ))}
                  </div>
                </div>

                {/* Voice Speed */}
                <div className="p-6 border-b border-white/5">
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-4">Voice Assistant Speed</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 w-12">Slow</span>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={s.voiceSpeed}
                      onChange={(e) => updateSetting("voiceSpeed", parseFloat(e.target.value))}
                      className="flex-1 accent-[#FFD700] h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs text-white/30 w-12 text-right">Fast</span>
                    <span className="text-sm font-bold text-[#FFD700] bg-[#FFD700]/10 rounded-lg px-3 py-1 min-w-[48px] text-center">
                      {s.voiceSpeed.toFixed(2)}x
                    </span>
                  </div>
                </div>

                {/* Wake Sensitivity */}
                <div className="p-6 border-b border-white/5">
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-4">Voice wake sensitivity</p>
                  <div className="flex gap-3">
                    {(["strict", "normal", "broad"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => updateSetting("wakeSensitivity", opt)}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold capitalize border transition-all cursor-pointer ${
                          s.wakeSensitivity === opt
                            ? "bg-[#FFD700]/15 text-[#FFD700] border-[#FFD700]/30"
                            : "bg-white/5 text-white/40 border-transparent hover:bg-white/8 hover:text-white/60"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Groq API Key */}
                <div className="p-6">
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-4">Groq API Key (Optional)</p>
                  <div className="relative flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                    <Key size={16} className="text-white/30" />
                    <input
                      type={showKey ? "text" : "password"}
                      placeholder="gsk_xxxxxxxxxxxx"
                      value={s.groqApiKey}
                      onChange={(e) => updateSetting("groqApiKey", e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm font-mono placeholder:text-white/10 caret-[#FFD700]"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-emerald-400 font-semibold"
                    >
                      ✓ Settings saved
                    </motion.span>
                  )}
                </AnimatePresence>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-6 py-3 bg-[#FFD700] hover:bg-[#ffe033] text-black font-bold rounded-xl text-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "general" && (
            <motion.div
              key="general-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl"
            >
              <div className="bg-[#121214] rounded-2xl border border-white/5 overflow-hidden">
                {/* Theme Selector */}
                <div className="p-6 border-b border-white/5">
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-4">Theme Preferences</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all cursor-pointer ${
                        themeMode === "dark"
                          ? "bg-[#FFD700]/10 border-[#FFD700]/30 text-white"
                          : "bg-white/5 border-transparent text-white/40 hover:bg-white/8"
                      }`}
                    >
                      <Moon size={24} className={themeMode === "dark" ? "text-[#FFD700]" : "text-white/40"} />
                      <span className="text-sm font-bold">Dark Theme</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all cursor-pointer ${
                        themeMode === "light"
                          ? "bg-white/10 border-white/30 text-white"
                          : "bg-white/5 border-transparent text-white/40 hover:bg-white/8"
                      }`}
                    >
                      <Sun size={24} className={themeMode === "light" ? "text-yellow-400" : "text-white/40"} />
                      <span className="text-sm font-bold">Light Theme</span>
                    </button>
                  </div>
                  <p className="text-xs text-white/30 mt-4">
                    Default theme is Dark mode. Light mode toggle provides an alternative ambient styling.
                  </p>
                </div>

                {/* Account Deletion */}
                <div className="p-6">
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-4">Danger Zone</p>
                  {!showDeleteConfirm ? (
                    <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Delete SubSync Account</p>
                        <p className="text-xs text-white/40 mt-1">Permanently remove subscriptions and user data.</p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-5 py-2.5 bg-red-500/25 border border-red-500/30 text-red-200 text-sm font-bold rounded-xl hover:bg-red-500/35 transition cursor-pointer flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete Account
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-4"
                    >
                      <div className="flex items-center gap-3 text-red-400">
                        <AlertTriangle size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">Are you absolutely sure?</span>
                      </div>
                      <p className="text-sm text-red-200/80 leading-relaxed">
                        This action cannot be undone. All database records for subscriptions, integrations, and preferences under this account ID will be permanently purged.
                      </p>
                      <div className="flex gap-3 justify-end">
                        <button
                          disabled={deleting}
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/8 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={deleting}
                          onClick={handleDeleteAccount}
                          className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition cursor-pointer flex items-center gap-2"
                        >
                          {deleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl"
            >
              <div className="bg-[#121214] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-4">Custom Dashboard Layout</p>
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-start gap-4">
                      <Layout className="text-[#FFD700] mt-0.5" size={20} />
                      <div>
                        <p className="text-sm font-bold text-white">Canva-Style Interactive Editor</p>
                        <p className="text-xs text-white/40 mt-2 leading-relaxed">
                          Reorganize and resize your app bento boxes directly on the screen. Drag any tile to change its order, and drag the corner handles to resize.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          localStorage.setItem("dashboard_edit_mode", "true");
                          router.push("/dashboard");
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD700] hover:bg-[#ffe033] text-black font-bold rounded-xl text-sm transition cursor-pointer"
                      >
                        <Layout size={16} /> Customize Dashboard Layout
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <button
                    onClick={() => {
                      // Reset layout logic would go here
                      alert("Layout reset functionality would be implemented here");
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/15 rounded-xl text-sm font-semibold text-white/80 transition cursor-pointer"
                  >
                    <RefreshCw size={14} /> Reset to Default Layout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
