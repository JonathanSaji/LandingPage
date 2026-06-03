"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Navigation, AppWindow, Database, ScrollText, LogOut, Clock, MousePointer, Bot, ChevronRight, Eye, EyeOff } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface SyncBotSettings {
  allowNavigation:    boolean;
  allowOpenApps:      boolean;
  allowDataSummary:   boolean;
  allowScrollControl: boolean;
  allowAuthActions:   boolean;
  allowTimeDate:      boolean;
  allowClickButtons:  boolean;
  allowAI:            boolean;
  groqApiKey:         string;
  voiceSpeed:         number;
  wakeSensitivity:    "strict" | "normal" | "broad";
}

export const DEFAULT_SETTINGS: SyncBotSettings = {
  allowNavigation:    true,
  allowOpenApps:      true,
  allowDataSummary:   true,
  allowScrollControl: true,
  allowAuthActions:   true,
  allowTimeDate:      true,
  allowClickButtons:  true,
  allowAI:            true,
  groqApiKey:         "",
  voiceSpeed:         1.05,
  wakeSensitivity:    "normal",
};

export function loadSettings(): SyncBotSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem("syncbot_settings");
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: SyncBotSettings): void {
  localStorage.setItem("syncbot_settings", JSON.stringify(s));
  localStorage.setItem("syncbot_speed", String(s.voiceSpeed));
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
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
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "11px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: checked ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 0.2s",
      }}>
        <Icon size={16} color={checked ? "#FFD700" : "rgba(255,255,255,0.35)"} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: checked ? "#fff" : "rgba(255,255,255,0.55)" }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
          {description}
        </p>
      </div>

      {/* Toggle pill */}
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 42, height: 24, borderRadius: 12, border: "none",
          background: checked ? "#FFD700" : "rgba(255,255,255,0.12)",
          cursor: "pointer", position: "relative", flexShrink: 0,
          transition: "background 0.25s",
        }}
      >
        <span style={{
          position: "absolute", top: 3,
          left: checked ? 21 : 3,
          width: 18, height: 18, borderRadius: "50%",
          background: checked ? "#000" : "rgba(255,255,255,0.5)",
          transition: "left 0.25s",
        }} />
      </button>
    </div>
  );
}

// ─── Main Settings Panel ──────────────────────────────────────────────────────
export function SyncBotSettings({ onClose }: { onClose: () => void }) {
  const [s, setS]         = useState<SyncBotSettings>(() => loadSettings());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = useCallback(<K extends keyof SyncBotSettings>(key: K, val: SyncBotSettings[K]) => {
    setS((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }, []);

  const handleSave = () => {
    saveSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const PERMISSIONS = [
    { key: "allowNavigation"    as const, icon: Navigation,   label: "Navigation",      description: "Say 'Go to dashboard', 'Go home'" },
    { key: "allowOpenApps"      as const, icon: AppWindow,    label: "Open Apps",       description: "Say 'Open TrackerSync', 'Open TravelSync'" },
    { key: "allowDataSummary"   as const, icon: Database,     label: "Summarize Data",  description: "Say 'Summarize my subscriptions'" },
    { key: "allowScrollControl" as const, icon: ScrollText,   label: "Scroll Control",  description: "Say 'Scroll down', 'Back to top'" },
    { key: "allowAuthActions"   as const, icon: LogOut,       label: "Auth Actions",    description: "Say 'Log me out', 'Open login'" },
    { key: "allowTimeDate"      as const, icon: Clock,        label: "Time & Date",     description: "Say 'What time is it?', 'What day?'" },
    { key: "allowClickButtons"  as const, icon: MousePointer, label: "Click by Voice",  description: "Say 'Click sign up', 'Press submit'" },
    { key: "allowAI"            as const, icon: Bot,          label: "AI Responses",    description: "Smart answers for open-ended questions" },
  ];

  return (
    <motion.div
      key="sb-settings-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
        padding: 24,
      }}
    >
      <motion.div
        key="sb-settings-panel"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360, maxHeight: "80vh",
          background: "rgba(12,12,14,0.96)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 20,
          backdropFilter: "blur(40px)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,215,0,0.06)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(255,215,0,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={16} color="#FFD700" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>SyncBot Settings</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Customise your AI assistant</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", padding: "0 20px 20px", flex: 1 }}>

          {/* Permissions */}
          <p style={{ margin: "16px 0 0", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            Permissions
          </p>
          {PERMISSIONS.map((p) => (
            <Toggle
              key={p.key}
              icon={p.icon}
              label={p.label}
              description={p.description}
              checked={s[p.key] as boolean}
              onChange={(v) => update(p.key, v)}
            />
          ))}

          {/* Voice Speed */}
          <p style={{ margin: "20px 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            Voice Speed
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", width: 32 }}>Slow</span>
            <input
              type="range" min="0.7" max="1.5" step="0.05"
              value={s.voiceSpeed}
              onChange={(e) => update("voiceSpeed", parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: "#FFD700", cursor: "pointer" }}
            />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", width: 32, textAlign: "right" }}>Fast</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#FFD700",
              background: "rgba(255,215,0,0.1)", borderRadius: 6, padding: "2px 7px", minWidth: 36, textAlign: "center",
            }}>
              {s.voiceSpeed.toFixed(2)}×
            </span>
          </div>

          {/* Wake Sensitivity */}
          <p style={{ margin: "20px 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            Wake Sensitivity
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {(["strict","normal","broad"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => update("wakeSensitivity", opt)}
                style={{
                  flex: 1, padding: "7px 0", borderRadius: 10, border: "none", cursor: "pointer",
                  background: s.wakeSensitivity === opt ? "rgba(255,215,0,0.18)" : "rgba(255,255,255,0.06)",
                  color: s.wakeSensitivity === opt ? "#FFD700" : "rgba(255,255,255,0.4)",
                  fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                  transition: "all 0.2s",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            {s.wakeSensitivity === "strict"
              ? "Only exact matches: 'SyncBot'"
              : s.wakeSensitivity === "normal"
              ? "Matches common variations"
              : "Matches broad phonetic patterns (more false positives)"}
          </p>

          {/* Groq API Key */}
          <p style={{ margin: "20px 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
            Groq API Key (optional)
          </p>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.09)" }}>
              <Key size={14} color="rgba(255,255,255,0.3)" />
              <input
                type={showKey ? "text" : "password"}
                placeholder="gsk_xxxxxxxxxxxx"
                value={s.groqApiKey}
                onChange={(e) => update("groqApiKey", e.target.value)}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#fff", fontSize: 12, fontFamily: "monospace",
                  caretColor: "#FFD700",
                }}
              />
              <button onClick={() => setShowKey(!showKey)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}>
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
              Get a free key at{" "}
              <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,215,0,0.5)" }}>
                console.groq.com
              </a>
              . Stored only in your browser.
            </p>
          </div>
        </div>

        {/* Footer — save button */}
        <div style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
          display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end",
        }}>
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}
              >
                ✓ Saved
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={onClose}
            style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 20px", borderRadius: 10, border: "none",
              background: "#FFD700", color: "#000", cursor: "pointer",
              fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
            }}
          >
            Save <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
