"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2, Box, Magnet, Mic, Check, Loader2, AlertCircle } from "lucide-react";

interface SteadySyncSettings {
  steady_mouse: boolean;
  hitbox_enabled: boolean;
  snap_enabled: boolean;
  voice_enabled: boolean;
  updated_at: string | null;
}

interface SteadySyncSettingsTileProps {
  userId: number;
  accent?: string;
}

const SETTINGS_CONFIG = [
  {
    key: "steady_mouse" as const,
    label: "Steady Mouse",
    description: "Smooths cursor movement to reduce tremor",
    Icon: MousePointer2,
  },
  {
    key: "hitbox_enabled" as const,
    label: "Hitbox Assist",
    description: "Enlarges click targets for easier interaction",
    Icon: Box,
  },
  {
    key: "snap_enabled" as const,
    label: "Snap Focus",
    description: "Snaps focus to nearby interactive elements",
    Icon: Magnet,
  },
  {
    key: "voice_enabled" as const,
    label: "Voice Control",
    description: "Navigate and interact using voice commands",
    Icon: Mic,
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;
const ACCENT = "#3A7B7B";

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      className="relative flex-shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        width: 40,
        height: 22,
        background: checked ? ACCENT : "rgba(255,255,255,0.12)",
        focusRingColor: ACCENT,
      }}
    >
      <span
        className="absolute top-[3px] rounded-full transition-all duration-300"
        style={{
          left: checked ? 21 : 3,
          width: 16,
          height: 16,
          background: checked ? "#fff" : "rgba(255,255,255,0.45)",
          boxShadow: checked ? `0 1px 4px rgba(0,0,0,0.35)` : "none",
        }}
      />
    </button>
  );
}

export function SteadySyncSettingsTile({ userId, accent = ACCENT }: SteadySyncSettingsTileProps) {
  const [settings, setSettings] = useState<SteadySyncSettings>({
    steady_mouse: false,
    hitbox_enabled: false,
    snap_enabled: false,
    voice_enabled: false,
    updated_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/steadysync/settings?userId=${userId}`);
      const data = await res.json();
      if (data.ok) {
        setSettings({
          steady_mouse: data.settings.steady_mouse ?? false,
          hitbox_enabled: data.settings.hitbox_enabled ?? false,
          snap_enabled: data.settings.snap_enabled ?? false,
          voice_enabled: data.settings.voice_enabled ?? false,
          updated_at: data.settings.updated_at ?? null,
        });
      }
    } catch (err) {
      console.error("Failed to load SteadySync settings:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = useCallback(
    async (key: keyof Omit<SteadySyncSettings, "updated_at">, value: boolean) => {
      // Optimistic update
      const prev = { ...settings };
      const next = { ...settings, [key]: value };
      setSettings(next);
      setPendingKey(key);
      setSaving(true);
      setSaveStatus("idle");

      try {
        const res = await fetch(`/api/steadysync/settings?userId=${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            steady_mouse: next.steady_mouse,
            hitbox_enabled: next.hitbox_enabled,
            snap_enabled: next.snap_enabled,
            voice_enabled: next.voice_enabled,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          setSettings((s) => ({ ...s, updated_at: data.settings.updated_at }));
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          // Rollback
          setSettings(prev);
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), 3000);
        }
      } catch {
        setSettings(prev);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } finally {
        setSaving(false);
        setPendingKey(null);
      }
    },
    [settings, userId]
  );

  const enabledCount = [
    settings.steady_mouse,
    settings.hitbox_enabled,
    settings.snap_enabled,
    settings.voice_enabled,
  ].filter(Boolean).length;

  const lastUpdated = settings.updated_at
    ? new Date(settings.updated_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[24px]"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 w-48 h-48 rounded-full blur-3xl"
        style={{ background: `${accent}10` }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col" style={{ padding: "22px 24px" }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="font-body font-semibold uppercase"
              style={{ color: accent, fontSize: 10, letterSpacing: "0.16em", opacity: 0.9 }}
            >
              ACCESS
            </p>
            <h2
              className="font-heading font-bold text-white mt-1"
              style={{ fontSize: 18 }}
            >
              SteadySync
            </h2>
          </div>

          {/* Status pill */}
          <div className="flex flex-col items-end gap-1">
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: `${accent}15`,
                border: `1px solid ${accent}30`,
              }}
            >
              <span
                className="block w-1.5 h-1.5 rounded-full"
                style={{
                  background: enabledCount > 0 ? accent : "rgba(255,255,255,0.2)",
                  boxShadow: enabledCount > 0 ? `0 0 6px ${accent}80` : "none",
                }}
              />
              <span
                className="font-body font-semibold"
                style={{ color: accent, fontSize: 10, letterSpacing: "0.1em" }}
              >
                {enabledCount} / 4 ON
              </span>
            </div>

            {/* Save feedback */}
            <AnimatePresence>
              {saveStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="flex items-center gap-1"
                >
                  {saveStatus === "saved" ? (
                    <>
                      <Check size={10} color="#4ade80" />
                      <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 600 }}>Saved</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={10} color="#f87171" />
                      <span style={{ fontSize: 10, color: "#f87171", fontWeight: 600 }}>Failed</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${accent}20, rgba(255,255,255,0.04), transparent)`,
            marginBottom: 14,
          }}
        />

        {/* Settings rows */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={18} color={accent} style={{ animation: "sb-spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div className="flex flex-col gap-2 flex-1">
            {SETTINGS_CONFIG.map(({ key, label, description, Icon }, i) => {
              const isOn = settings[key];
              const isPending = saving && pendingKey === key;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
                  className="group flex items-center gap-3 rounded-xl transition-colors duration-200"
                  style={{
                    padding: "9px 12px",
                    background: isOn ? `${accent}0a` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isOn ? `${accent}25` : "rgba(255,255,255,0.05)"}`,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex items-center justify-center flex-shrink-0 rounded-lg transition-colors duration-200"
                    style={{
                      width: 30,
                      height: 30,
                      background: isOn ? `${accent}20` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isOn ? `${accent}35` : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    {isPending ? (
                      <Loader2 size={13} color={accent} style={{ animation: "sb-spin 0.6s linear infinite" }} />
                    ) : (
                      <Icon size={13} color={isOn ? accent : "rgba(255,255,255,0.35)"} />
                    )}
                  </div>

                  {/* Label + desc */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-body font-semibold truncate"
                      style={{
                        fontSize: 12,
                        color: isOn ? "#fff" : "rgba(255,255,255,0.6)",
                        lineHeight: 1.2,
                      }}
                    >
                      {label}
                    </p>
                    <p
                      className="font-body truncate mt-0.5"
                      style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", lineHeight: 1.3 }}
                    >
                      {description}
                    </p>
                  </div>

                  {/* Toggle */}
                  <ToggleSwitch
                    checked={isOn}
                    onChange={(v) => handleToggle(key, v)}
                    disabled={saving}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {lastUpdated && !loading && (
          <p
            className="font-body mt-3 text-right"
            style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}
          >
            Last saved {lastUpdated}
          </p>
        )}
      </div>
    </div>
  );
}