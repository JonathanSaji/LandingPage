"use client";

declare global {
  interface Window {
    __syncbot_context?: {
      page: string;
      subscriptions: Array<{ id: string; name: string; amount: string; date: string; color: string; billingCycle: string; subscriptionType: string; isTrial: boolean; amountPerCycle: string; personalValue: number }>;
      trips: Array<{ id: string; name: string; location: string | null; dates: string | null; group: string | null; peopleCount: number; budget: string | null; updatedAt: string }>;
      presets: Array<{ id: string; title: string; intent: string; duration: number; stats: string; created_at: string }>;
      insights: Array<{ id: string; title: string; intent: string; duration: number; start_time: string | number; end_time: string | number; completed_at: string; analytics: { focusScore?: number; distractionsBlocked?: number } | null }>;
      fluencySessions: Array<{ id: string; duration: number | null; wpm: number | null; filler_word_count: number | null; created_at: string }>;
      tiles: Array<{ id: string; name: string; category: string }>;
      lastUpdated: number;
    };
  }
}

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Volume2, VolumeX, Settings, HelpCircle, X, Loader2,
} from "lucide-react";
import { useVoiceCommand, playChime } from "@/hooks/useVoiceCommand";
import { SyncBotSettings, DEFAULT_SETTINGS, loadSettings } from "./syncbot-settings";
import { SyncBotSettings as SettingsPanel } from "./syncbot-settings";
import { SyncBotGuide } from "./syncbot-guide";

// ─── Page context harvested from window + DOM ────────────────────────────────
interface PageContext {
  page: string;
  username: string;
  time: string;
  date: string;
  subscriptions?: Array<{
    name: string; amount: string; date: string;
    billingCycle: string; isTrial: boolean; personalValue: number;
  }>;
  trips?: Array<{
    name: string; location: string | null; dates: string | null;
    group: string | null; peopleCount: number; budget: string | null;
  }>;
  brainInsights?: Array<{
    title: string; duration: number; focusScore?: number;
    distractionsBlocked?: number; completed_at: string;
  }>;
  brainPresets?: Array<{ title: string; intent: string; duration: number }>;
  fluencySessions?: Array<{
    duration: number | null; wpm: number | null;
    filler_word_count: number | null; created_at: string;
  }>;
  visibleApps?: string[];
  pageText?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getUserInfo(): { name: string; accountId: string | null } {
  try {
    const token = localStorage.getItem("subsync_token");
    if (!token) return { name: "there", accountId: null };
    const p = JSON.parse(atob(token));
    const name = p.displayName || p.username || p.email?.split("@")[0] || "there";
    return { name, accountId: p.accountId ?? null };
  } catch {
    return { name: "there", accountId: null };
  }
}

// ─── Chat bubble Thinking dots ─────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: "rgba(255,215,0,0.6)",
          animation: `sb-think 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Animated waveform ─────────────────────────────────────────────────────────
function Waveform() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[0.5, 0.9, 0.6, 1.0, 0.7].map((h, i) => (
        <span key={i} style={{
          display: "block", width: "3px", borderRadius: "2px",
          background: "#FFD700", transformOrigin: "center",
          animation: `sb-bar ${0.5 + i * 0.1}s ease-in-out ${i * 0.08}s infinite alternate`,
          height: `${12 * h}px`,
        }} />
      ))}
    </div>
  );
}

// ─── Pulse dot ────────────────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  return (
    <span style={{
      display: "block", width: 7, height: 7, borderRadius: "50%",
      background: color, animation: "sb-pulse 2s ease-in-out infinite", flexShrink: 0,
    }} />
  );
}

// ─── Chat message types ────────────────────────────────────────────────────────
interface ChatMsg { role: "user" | "bot"; text: string; id: number }

// ─── Main component ────────────────────────────────────────────────────────────
export function SyncBotVoiceControl() {
  const router   = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings,   setSettings]   = useState<SyncBotSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide,    setShowGuide]    = useState(false);
  const [chat,         setChat]         = useState<ChatMsg[]>([]);
  const [isThinking,   setIsThinking]   = useState(false);

  const msgId    = useRef(0);
  const thinkRef = useRef(false); // prevent double AI calls
  const lastCmdRef = useRef<{ text: string; time: number }>({ text: "", time: 0 });

  const {
    botState, isSupported, isMuted,
    transcript, interimTranscript, activeListening,
    startListening, stopListening, setActiveListening,
    setMuted, speak, unlockSpeech,
    setOnWakeWord, setOnCommand, setOnSleep,
  } = useVoiceCommand();

  // ── Reload settings ──────────────────────────────────────────────────────────
  const refreshSettings = useCallback(() => {
    const s = loadSettings();
    setSettings(s);
  }, []);

  // ── Auth check ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem("subsync_token"));
    check();
    refreshSettings();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, [pathname, refreshSettings]);

  // ── Auto-start mic when logged in ────────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && isSupported) startListening();
    else stopListening();
  }, [isLoggedIn, isSupported, startListening, stopListening]);

  // ── Chat helpers ─────────────────────────────────────────────────────────────
  const addMsg = useCallback((role: "user" | "bot", text: string): number => {
    const id = msgId.current++;
    setChat((prev) => {
      const next = [...prev, { role, text, id }];
      return next.slice(-6); // keep last 6 messages
    });
    return id;
  }, []);

  const updateMsg = useCallback((id: number, text: string) => {
    setChat((prev) => prev.map((m) => m.id === id ? { ...m, text } : m));
  }, []);

  const buildPageContext = useCallback((): PageContext => {
    const { name } = getUserInfo();
    const base: PageContext = {
      page: pathname,
      username: name,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    };

    if (!settings.allowDataSummary) {
      return base;
    }

    const ctx = typeof window !== "undefined" ? window.__syncbot_context : undefined;
    if (ctx && pathname === "/dashboard") {
      if (ctx.subscriptions.length > 0) {
        base.subscriptions = ctx.subscriptions.slice(0, 10).map((s) => ({
          name: s.name,
          amount: s.amount,
          date: s.date,
          billingCycle: s.billingCycle,
          isTrial: s.isTrial,
          personalValue: s.personalValue,
        }));
      }

      if (ctx.trips.length > 0) {
        base.trips = ctx.trips.slice(0, 8).map((t) => ({
          name: t.name,
          location: t.location,
          dates: t.dates,
          group: t.group,
          peopleCount: t.peopleCount,
          budget: t.budget,
        }));
      }

      if (ctx.insights.length > 0) {
        base.brainInsights = ctx.insights.slice(0, 5).map((i) => ({
          title: i.title,
          duration: i.duration,
          focusScore: i.analytics?.focusScore,
          distractionsBlocked: i.analytics?.distractionsBlocked,
          completed_at: i.completed_at,
        }));
      }

      if (ctx.presets.length > 0) {
        base.brainPresets = ctx.presets.slice(0, 5).map((p) => ({
          title: p.title,
          intent: p.intent,
          duration: p.duration,
        }));
      }

      if (ctx.fluencySessions.length > 0) {
        base.fluencySessions = ctx.fluencySessions.slice(0, 5).map((f) => ({
          duration: f.duration,
          wpm: f.wpm,
          filler_word_count: f.filler_word_count,
          created_at: f.created_at,
        }));
      }

      if (ctx.tiles.length > 0) {
        base.visibleApps = ctx.tiles.map((t) => t.name);
      }
    }

    if (pathname === "/" && typeof document !== "undefined") {
      const mainEl = document.querySelector<HTMLElement>("main") ?? document.body;
      const rawText = mainEl.innerText ?? "";
      base.pageText = rawText.replace(/\s+/g, " ").trim().slice(0, 600);
    }

    return base;
  }, [pathname, settings.allowDataSummary]);

  // ── Call AI ──────────────────────────────────────────────────────────────────
  const askAI = useCallback(async (
    message: string,
    onChunk: (text: string) => void
  ): Promise<{ reply: string; action?: Record<string, unknown> }> => {
    const context = buildPageContext();

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (settings.groqApiKey) (headers as Record<string,string>)["x-groq-key"] = settings.groqApiKey;

    const res = await fetch("/api/syncbot/chat", {
      method: "POST",
      headers,
      body: JSON.stringify({ message, context }),
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return {
        reply: data.reply ?? "Something went wrong.",
        action: data.action,
      };
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No readable stream body");

    const decoder = new TextDecoder();
    let accumulated = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed === "data: [DONE]") continue;
        if (trimmed.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              accumulated += delta;
              onChunk(accumulated);
            }
          } catch (e) {
            console.warn("[SyncBot] SSE parse error:", e, trimmed);
          }
        }
      }
    }

    // Parse action if present at the end
    let cleanReply = accumulated;
    let action: Record<string, unknown> | undefined;
    const actionMatch = accumulated.match(/\[ACTION:(.*?)\]/);
    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1]);
        cleanReply = accumulated.replace(/\[ACTION:.*?\]/g, "").trim();
      } catch (e) {
        console.error("[SyncBot] Action parse error:", e);
      }
    }

    return { reply: cleanReply, action };
  }, [settings.groqApiKey, buildPageContext]);

  // ── Execute AI action ────────────────────────────────────────────────────────
  const executeAction = useCallback((action: Record<string, unknown>) => {
    const APPS = [
      { names: ["trackersync","tracker","track","tracker sink","track a sync","trackers ink","tracker think","trackers inc","finance","subscription","subs"], url: "https://trackersync.sub-sync.ca", label: "TrackerSync" },
      { names: ["travelsync","travel","travel sink","travel sync","travels inc","travels ink","travels think","trip","trips"], url: "https://travelsync.sub-sync.ca", label: "TravelSync" },
      { names: ["brainsync","brain","brain sink","brainsync","brains sync","brain think","brain zinc","focus","deep work"], url: "https://brainsync.sub-sync.ca", label: "BrainSync" },
      { names: ["seatsync","seat","seat sink","seat sync","seats inc","see sync","seed sync","desk","booking"], url: "https://seatsync.sub-sync.ca", label: "SeatSync" },
      { names: ["photosync","photo","photo sink","photo sync","photos inc","photos ink","foto sync","picture","pictures","album"], url: "https://photosync.sub-sync.ca", label: "PhotoSync" },
      { names: ["fluencysync","fluency","fluency sink","fluency sync","fluent sync","fluencies inc","fluency think","speech","speaking"], url: "https://fluencysync.sub-sync.ca", label: "FluencySync" },
      { names: ["steadysync","steady","steady sink","steady sync","steadies inc","study sync","study sink","accessibility","tremor"], url: "https://steadysync.sub-sync.ca", label: "SteadySync" },
    ];

    const type = action.type as string;
    if (type === "navigate" && settings.allowNavigation) {
      router.push(action.path as string);
    } else if (type === "open_app" && settings.allowOpenApps) {
      const appName = (action.app || action.name || "").toString().toLowerCase();
      const app = APPS.find((a) => a.names.some((n) => appName.includes(n) || n.includes(appName)));
      const url = app ? app.url : (action.url as string);
      if (url) {
        window.open(url, "_blank");
      }
    } else if (type === "scroll" && settings.allowScrollControl) {
      const dir = action.direction as string;
      if (dir === "top")    window.scrollTo({ top: 0, behavior: "smooth" });
      else if (dir === "bottom") window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      else if (dir === "up")   window.scrollBy({ top: -400, behavior: "smooth" });
      else if (dir === "down") window.scrollBy({ top: 400, behavior: "smooth" });
    } else if (type === "logout" && settings.allowAuthActions) {
      localStorage.removeItem("subsync_token");
      window.dispatchEvent(new Event("storage"));
      stopListening();
      router.push("/");
    } else if (type === "open_modal") {
      window.dispatchEvent(new Event("syncbot:open-auth-modal"));
    }
  }, [settings, router, stopListening]);

  // ── Register sleep handler ────────────────────────────────────────────────────
  useEffect(() => {
    setOnSleep(() => {
      playChime("off");
      const reply = "Going to sleep. Say wake up when you need me.";
      speak(reply);
      addMsg("bot", reply);
      setTimeout(() => setActiveListening(false), 800);
    });
  }, [setOnSleep, speak, addMsg, setActiveListening]);

  // ── Register wake-word handler ───────────────────────────────────────────────
  useEffect(() => {
    setOnWakeWord(() => {
      setChat([]);
      const { name } = getUserInfo();
      const greeting = `Online, ${name}. What can I do for you?`;
      addMsg("bot", greeting);
      setTimeout(() => speak(greeting), 500);
    });
  }, [setOnWakeWord, speak, addMsg]);

  // Helper to strip action syntax during streaming
  const cleanStreamingText = useCallback((text: string): string => {
    let cleaned = text.replace(/\[ACTION:.*?\]/g, "");
    const bracketIndex = cleaned.lastIndexOf("[");
    if (bracketIndex !== -1 && bracketIndex >= cleaned.length - 80) {
      cleaned = cleaned.substring(0, bracketIndex);
    }
    return cleaned.trim();
  }, []);

  // ── Register command handler — everything goes to AI ─────────────────────────
  useEffect(() => {
    setOnCommand(async (cmd: string) => {
      // Deduplication guard
      const now = Date.now();
      if (cmd === lastCmdRef.current.text && now - lastCmdRef.current.time < 2500) return;
      lastCmdRef.current = { text: cmd, time: now };

      // Prevent overlapping AI calls
      if (thinkRef.current) return;

      addMsg("user", cmd);

      if (!settings.allowAI) {
        const reply = "AI is disabled. Enable it in settings to use SyncBot.";
        speak(reply);
        addMsg("bot", reply);
        return;
      }

      thinkRef.current = true;
      setIsThinking(true);
      const botMsgId = addMsg("bot", "");

      try {
        const { reply, action } = await askAI(cmd, (accumulated) => {
          const display = cleanStreamingText(accumulated);
          updateMsg(botMsgId, display);
        });

        setIsThinking(false);
        thinkRef.current = false;

        const cleanReply = cleanStreamingText(reply);
        updateMsg(botMsgId, cleanReply);
        speak(cleanReply);

        if (action) executeAction(action);
      } catch (err) {
        console.error("[SyncBot] askAI error:", err);
        setIsThinking(false);
        thinkRef.current = false;
        const retryMsg = "I didn't catch that. Could you say it again?";
        speak(retryMsg);
        updateMsg(botMsgId, retryMsg);
      }
    });
  }, [setOnCommand, askAI, executeAction, speak, addMsg, updateMsg, settings.allowAI, cleanStreamingText]);

  // ── Click pill handler ───────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    unlockSpeech(); // CRITICAL: unlock on user gesture
    if (activeListening) {
      playChime("off");
      setTimeout(() => speak("Going to sleep. Say wake up when you need me."), 150);
      setActiveListening(false);
    } else {
      playChime("on");
      setTimeout(() => speak("Online. How can I help?"), 150);
      setActiveListening(true);
    }
  }, [activeListening, setActiveListening, speak, unlockSpeech]);

  // ── Inject keyframes ─────────────────────────────────────────────────────────
  useEffect(() => {
    const id = "sb-kf";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes sb-bar   { from{transform:scaleY(.25)} to{transform:scaleY(1)} }
      @keyframes sb-pulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.25)} }
      @keyframes sb-ring  { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.8);opacity:0} }
      @keyframes sb-think { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
      @keyframes sb-hint  { 0%{opacity:0;transform:translateY(4px)} 15%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0} }
    `;
    document.head.appendChild(s);
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────────
  const isListening  = botState === "listening";
  const isSpeaking   = botState === "speaking";
  const isSleeping   = botState === "sleeping";
  const showChat     = activeListening && (chat.length > 0 || isThinking || transcript || interimTranscript);
  const lastMessages = chat.slice(-4);

  // ── Not logged in — render nothing ───────────────────────────────────────────
  if (!isLoggedIn) return null;
  if (!isSupported && typeof window !== "undefined") return null;

  return (
    <>
      {/* ── Global keyframe & sonar ring ───────────────────────────────────── */}
      {isListening && !isMuted && activeListening && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9990,
          width: 48, height: 48, borderRadius: "50%",
          border: "2px solid rgba(255,215,0,0.3)",
          animation: "sb-ring 2s ease-out infinite", pointerEvents: "none",
        }} />
      )}

      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            key="sb-chat"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{
              position: "fixed", bottom: 82, right: 24, zIndex: 9998,
              width: 300,
              background: "rgba(8,8,10,0.94)",
              backdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 16,
              boxShadow: "0 16px 60px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            {/* Chat header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <PulseDot color={isSpeaking ? "#FFD700" : isListening ? "#22c55e" : "#888"} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                  {isSpeaking ? "Speaking" : isListening ? "Listening" : "SyncBot"}
                </span>
              </div>
              <button
                onClick={() => setChat([])}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", display: "flex" }}
              >
                <X size={13} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              {lastMessages.map((m) => (
                <div key={m.id} style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth: "85%",
                    background: m.role === "user"
                      ? "rgba(255,215,0,0.12)"
                      : "rgba(255,255,255,0.06)",
                    border: `1px solid ${m.role === "user" ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    padding: "7px 11px",
                  }}>
                    <p style={{
                      margin: 0, fontSize: 12, lineHeight: 1.5,
                      color: m.role === "user" ? "rgba(255,215,0,0.9)" : "rgba(255,255,255,0.85)",
                    }}>
                      {m.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* Thinking */}
              {isThinking && (
                <div style={{ display: "flex" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px 12px 12px 3px", padding: "7px 11px",
                  }}>
                    <ThinkingDots />
                  </div>
                </div>
              )}

              {/* Interim transcript */}
              {interimTranscript && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,215,0,0.4)", fontStyle: "italic" }}>
                    {interimTranscript}…
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Control bar ────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", alignItems: "center", gap: 8 }}>

        {/* Help button */}
        <AnimatePresence>
          {activeListening && (
            <motion.button
              key="sb-help"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setShowGuide(true)}
              title="Voice commands guide"
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(20px)",
              }}
            >
              <HelpCircle size={15} color="rgba(255,255,255,0.4)" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Mute button */}
        <AnimatePresence>
          {activeListening && (
            <motion.button
              key="sb-mute"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { setMuted(!isMuted); }}
              title={isMuted ? "Unmute" : "Mute"}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)",
                background: isMuted ? "rgba(255,80,80,0.15)" : "rgba(0,0,0,0.7)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(20px)",
              }}
            >
              {isMuted
                ? <VolumeX size={15} color="rgba(255,100,100,0.8)" />
                : <Volume2 size={15} color="rgba(255,255,255,0.4)" />
              }
            </motion.button>
          )}
        </AnimatePresence>

        {/* Settings button */}
        <AnimatePresence>
          {activeListening && (
            <motion.button
              key="sb-settings"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setShowSettings(true)}
              title="SyncBot settings"
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(20px)",
              }}
            >
              <Settings size={15} color="rgba(255,255,255,0.4)" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main pill */}
        <div style={{ position: "relative" }}>
          {/* Tooltip hint while sleeping */}
          {isSleeping && !activeListening && (
            <div style={{
              position: "absolute", bottom: "120%", right: 0, pointerEvents: "none",
              background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10,
              padding: "6px 12px", whiteSpace: "nowrap", opacity: 0,
              animation: "sb-hint 5s ease-in-out 2s forwards",
            }}>
              <span style={{ fontSize: 11, color: "rgba(255,215,0,0.7)", fontWeight: 600 }}>
                Click to activate · Say &ldquo;wake up&rdquo; to activate
              </span>
            </div>
          )}

          <motion.button
            onClick={handleClick}
            aria-label="SyncBot voice assistant"
            whileTap={{ scale: 0.91 }}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: activeListening ? "10px 18px" : "9px 15px",
              borderRadius: 999,
              background: activeListening ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0.68)",
              border: `1px solid ${
                isListening && !isMuted ? "rgba(255,215,0,0.45)"
                : isSpeaking            ? "rgba(255,215,0,0.3)"
                : isSleeping            ? "rgba(255,255,255,0.08)"
                :                         "rgba(255,255,255,0.1)"
              }`,
              boxShadow: activeListening
                ? "0 0 28px rgba(255,215,0,0.1), 0 4px 20px rgba(0,0,0,0.6)"
                : "0 2px 14px rgba(0,0,0,0.4)",
              backdropFilter: "blur(24px)",
              cursor: "pointer", userSelect: "none",
              transition: "all 0.25s ease",
            }}
          >
            {/* Icon */}
            {isSpeaking ? (
              <Volume2 size={15} color="#FFD700" style={{ animation: "sb-pulse 1s ease-in-out infinite" }} />
            ) : isListening && isMuted ? (
              <VolumeX size={15} color="rgba(255,100,100,0.8)" />
            ) : isListening && activeListening ? (
              <Waveform />
            ) : isThinking ? (
              <Loader2 size={15} color="#FFD700" style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Mic size={15} color={activeListening ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)"} />
            )}

            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isListening && !isMuted && activeListening && <PulseDot color="#22c55e" />}
              {isListening && isMuted && activeListening   && <PulseDot color="rgba(255,100,100,0.7)" />}
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase",
                color: activeListening ? "#FFD700" : "rgba(255,215,0,0.5)",
              }}>
                {isSpeaking                              ? "Speaking…"
                 : isThinking                            ? "Thinking…"
                 : isListening && isMuted && activeListening ? "Muted"
                 : isListening && activeListening        ? "Listening"
                 : isSleeping                            ? "SyncBot"
                 :                                         "SyncBot"}
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel onClose={() => { setShowSettings(false); refreshSettings(); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showGuide && <SyncBotGuide onClose={() => setShowGuide(false)} />}
      </AnimatePresence>
    </>
  );
}
