"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Navigation, AppWindow, Database, ScrollText, LogOut, Clock, MousePointer, Bot, ChevronRight, Eye, EyeOff, Sun, Moon, Trash2, Layout, RefreshCw, AlertTriangle } from "lucide-react";
import { loadSettings, saveSettings, type SyncBotSettings } from "./syncbot-settings";
import { useRouter } from "next/navigation";

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

export function SettingsPopup({
  onClose,
  initialTab = "settings",
  onEnterEditMode,
  onResetLayout,
}: {
  onClose: () => void;
  initialTab?: "settings" | "general" | "dashboard";
  onEnterEditMode?: () => void;
  onResetLayout?: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"settings" | "general" | "dashboard">(initialTab);
  
  // Settings State
  const [s, setS] = useState<SyncBotSettings>(() => loadSettings());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

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
    // Mock theme toggle response in UI
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
        onClose();
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

  const handleSaveSettings = () => {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col relative"
        style={{
          height: "85vh",
          maxHeight: "680px",
          background: "rgba(12,12,14,0.96)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,215,0,0.05)",
        }}
      >
        {/* Accent top line */}
        <div
          style={{
            height: "3px",
            background: "linear-gradient(90deg, transparent, #FFD700, transparent)",
          }}
          className="absolute top-0 left-0 right-0 z-10"
        />

        {/* Header Tabs */}
        <div className="pt-6 px-6 pb-2 flex-shrink-0 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("settings")}
              className={`font-heading text-xs font-bold pb-2 relative transition-colors ${activeTab === "settings" ? "text-white" : "text-white/40 hover:text-white/60"}`}
            >
              SyncBot Settings
            </button>
            <button
              onClick={() => setActiveTab("general")}
              className={`font-heading text-xs font-bold pb-2 relative transition-colors ${activeTab === "general" ? "text-white" : "text-white/40 hover:text-white/60"}`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`font-heading text-xs font-bold pb-2 relative transition-colors ${activeTab === "dashboard" ? "text-white" : "text-white/40 hover:text-white/60"}`}
            >
              Dashboard Settings
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === "settings" && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Permissions list */}
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-2">Permissions</p>
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
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-3">Voice Assistant Speed</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 w-8">Slow</span>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={s.voiceSpeed}
                      onChange={(e) => updateSetting("voiceSpeed", parseFloat(e.target.value))}
                      className="flex-1 accent-[#FFD700] h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-white/30 w-8 text-right">Fast</span>
                    <span className="text-[11px] font-bold text-[#FFD700] bg-[#FFD700]/10 rounded px-2 py-0.5 min-w-[36px] text-center">
                      {s.voiceSpeed.toFixed(2)}x
                    </span>
                  </div>
                </div>

                {/* Wake Sensitivity */}
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-3">Voice wake sensitivity</p>
                  <div className="flex gap-2">
                    {(["strict", "normal", "broad"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => updateSetting("wakeSensitivity", opt)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
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
                <div className="pb-4">
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-3">Groq API Key (Optional)</p>
                  <div className="relative flex items-center gap-2.5 px-3.5 py-3 bg-white/5 border border-white/10 rounded-xl">
                    <Key size={14} className="text-white/30" />
                    <input
                      type={showKey ? "text" : "password"}
                      placeholder="gsk_xxxxxxxxxxxx"
                      value={s.groqApiKey}
                      onChange={(e) => updateSetting("groqApiKey", e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-white text-xs font-mono placeholder:text-white/10 caret-[#FFD700]"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "general" && (
              <motion.div
                key="general-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Theme Selector */}
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-3">Theme Preferences</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        themeMode === "dark"
                          ? "bg-[#FFD700]/10 border-[#FFD700]/30 text-white"
                          : "bg-white/5 border-transparent text-white/40 hover:bg-white/8"
                      }`}
                    >
                      <Moon size={20} className={themeMode === "dark" ? "text-[#FFD700]" : "text-white/40"} />
                      <span className="text-xs font-bold">Dark Theme</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        themeMode === "light"
                          ? "bg-white/10 border-white/30 text-white"
                          : "bg-white/5 border-transparent text-white/40 hover:bg-white/8"
                      }`}
                    >
                      <Sun size={20} className={themeMode === "light" ? "text-yellow-400" : "text-white/40"} />
                      <span className="text-xs font-bold">Light Theme</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-white/20 mt-2">
                    Default theme is Dark mode. Light mode toggle provides an alternative ambient styling.
                  </p>
                </div>

                {/* Account Deletion */}
                <div className="pt-6 border-t border-white/5">
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-3">Danger Zone</p>
                  {!showDeleteConfirm ? (
                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">Delete SubSync Account</p>
                        <p className="text-[10px] text-white/40 mt-0.5">Permanently remove subscriptions and user data.</p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-500/25 border border-red-500/30 text-red-200 text-xs font-bold rounded-xl hover:bg-red-500/35 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 size={13} /> Delete Account
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-4"
                    >
                      <div className="flex items-center gap-3 text-red-400">
                        <AlertTriangle size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">Are you absolutely sure?</span>
                      </div>
                      <p className="text-[11px] text-red-200/80 leading-relaxed">
                        This action cannot be undone. All database records for subscriptions, integrations, and preferences under this account ID will be permanently purged.
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          disabled={deleting}
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/8 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={deleting}
                          onClick={handleDeleteAccount}
                          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                        >
                          {deleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-white/20 uppercase mb-3">Custom Dashboard Layout</p>
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-start gap-3">
                      <Layout className="text-[#FFD700] mt-0.5" size={18} />
                      <div>
                        <p className="text-xs font-bold text-white">Canva-Style Interactive Editor</p>
                        <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                          Reorganize and resize your app bento boxes directly on the screen. Drag any tile to change its order, and drag the corner handles to resize.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          onEnterEditMode?.();
                          onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD700] hover:bg-[#ffe033] text-black font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        <Layout size={14} /> Customize Dashboard Layout
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      onResetLayout?.();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/15 rounded-xl text-xs font-semibold text-white/80 transition cursor-pointer"
                  >
                    <RefreshCw size={12} /> Reset to Default Layout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-white/5 flex-shrink-0 flex items-center justify-end gap-3 bg-black/40">
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-emerald-400 font-semibold"
              >
                ✓ Settings saved
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-white/10 rounded-xl text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition cursor-pointer"
          >
            Cancel
          </button>
          {activeTab === "settings" && (
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 bg-[#FFD700] hover:bg-[#ffe033] text-black font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              Save Changes <ChevronRight size={13} />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
