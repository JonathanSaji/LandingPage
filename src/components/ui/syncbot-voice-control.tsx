"use client";

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

// ─── App registry ──────────────────────────────────────────────────────────────
const APPS = [
  { names: ["trackersync","tracker","track","tracker sink","track a sync","trackers ink","tracker think","trackers inc"], url: "https://trackersync.sub-sync.ca", label: "TrackerSync" },
  { names: ["travelsync","travel","travel sink","travel sync","travels inc","travels ink","travels think"], url: "https://travelsync.sub-sync.ca", label: "TravelSync" },
  { names: ["brainsync","brain","brain sink","brainsync","brains sync","brain think","brain zinc"], url: "https://brainsync.sub-sync.ca", label: "BrainSync" },
  { names: ["seatsync","seat","seat sink","seat sync","seats inc","see sync","seed sync"], url: "https://seatsync.sub-sync.ca", label: "SeatSync" },
  { names: ["photosync","photo","photo sink","photo sync","photos inc","photos ink","foto sync"], url: "https://photosync.sub-sync.ca", label: "PhotoSync" },
  { names: ["fluencysync","fluency","fluency sink","fluency sync","fluent sync","fluencies inc","fluency think"], url: "https://fluencysync.sub-sync.ca", label: "FluencySync" },
  { names: ["steadysync","steady","steady sink","steady sync","steadies inc","study sync","study sink"], url: "https://steadysync.sub-sync.ca", label: "SteadySync" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const dist = editDistance(longer, shorter);
  return (longer.length - dist) / longer.length;
}

function fuzzyMatch(input: string, patterns: string[], threshold = 0.55): boolean {
  const inputTokens = tokenize(input);
  if (inputTokens.length === 0) return false;

  for (const pattern of patterns) {
    const patternTokens = tokenize(pattern);
    if (patternTokens.length === 0) continue;

    let matched = 0;
    for (const pt of patternTokens) {
      const best = Math.max(...inputTokens.map((it) => stringSimilarity(it, pt)));
      if (best >= 0.75) matched++;
    }
    const overlapScore = matched / patternTokens.length;
    if (overlapScore >= threshold) return true;

    const phraseScore = stringSimilarity(input.toLowerCase(), pattern.toLowerCase());
    if (phraseScore >= threshold) return true;
  }
  return false;
}

function looksLowConfidence(text: string): boolean {
  const words = text.trim().split(/\s+/);
  if (text.length < 4) return true;
  if (words.length === 1 && text.length < 6) return true;
  return /^\d+$/.test(text.trim());
}

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
  const [isMutedLocal, setIsMutedLocal] = useState(false);

  const msgId    = useRef(0);
  const thinkRef = useRef(false); // prevent double AI calls
  const lastCmdRef = useRef<{ text: string; time: number }>({ text: "", time: 0 });

  const {
    botState, isSupported, isMuted,
    transcript, interimTranscript, activeListening,
    startListening, stopListening, setActiveListening,
    setMuted, speak, cancelSpeech, unlockSpeech,
    setOnWakeWord, setOnCommand,
  } = useVoiceCommand();

  // ── Reload settings ──────────────────────────────────────────────────────────
  const refreshSettings = useCallback(() => {
    const s = loadSettings();
    setSettings(s);
    setIsMutedLocal(false);
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


  // ── Call AI ──────────────────────────────────────────────────────────────────
  const askAI = useCallback(async (
    message: string,
    onChunk: (text: string) => void
  ): Promise<{ reply: string; action?: Record<string, unknown> }> => {
    const { name, accountId } = getUserInfo();
    let subscriptions: unknown[] = [];
    if (accountId && settings.allowDataSummary) {
      try {
        const r = await fetch(`/api/subscriptions?userId=${accountId}`);
        const d = await r.json();
        if (d.ok) subscriptions = d.subscriptions?.slice(0, 5) ?? [];
      } catch { /* ignore */ }
    }

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (settings.groqApiKey) (headers as Record<string,string>)["x-groq-key"] = settings.groqApiKey;

    const res = await fetch("/api/syncbot/chat", {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        context: {
          username: name,
          page: pathname,
          subscriptions,
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
        },
      }),
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
  }, [settings, pathname]);

  // ── Execute AI action ────────────────────────────────────────────────────────
  const executeAction = useCallback((action: Record<string, unknown>) => {
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

  // ── Local command handler — handles the most common commands without AI ──────
  const handleLocalCommand = useCallback(async (cmd: string): Promise<boolean> => {
    const c = cmd.toLowerCase().trim();

    // ── NAVIGATION / SCROLL ──────────────────────────────────────────────────
    if (settings.allowNavigation) {
      if (fuzzyMatch(c, [
        "open dashboard", "go to dashboard", "take me to dashboard", "dashboard", "go dashboard", "my dashboard",
        "dash word", "dash board", "my dash", "go to my dash word", "open dash", "take me to dash",
      ])) {
        const reply = "Navigating to your dashboard.";
        speak(reply); addMsg("bot", reply);
        router.push("/dashboard");
        return true;
      }
      if (fuzzyMatch(c, [
        "go home", "go to homepage", "open home", "landing page", "home page", "main page",
        "go on", "go tone", "homepage", "go to main", "open main page",
      ])) {
        const reply = "Going back to the landing page.";
        speak(reply); addMsg("bot", reply);
        router.push("/");
        return true;
      }
    }
    if (settings.allowScrollControl) {
      if (fuzzyMatch(c, [
        "scroll to bottom", "take me to the bottom", "scroll all the way down", "go to bottom", "go to the bottom",
        "school to bottom", "scroll bought them", "go bottom", "take me bottom", "all the way down",
      ])) {
        const reply = "Scrolling to the bottom.";
        speak(reply); addMsg("bot", reply);
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        return true;
      }
      if (fuzzyMatch(c, [
        "scroll to top", "take me to the top", "scroll all the way up", "go to top", "go to the top",
        "school to top", "stroll to top", "go top", "take me top", "all the way up",
      ])) {
        const reply = "Scrolling to the top.";
        speak(reply); addMsg("bot", reply);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return true;
      }
      if (fuzzyMatch(c, [
        "scroll down", "scroll page down", "school down", "scroll town", "stroll down", "scroll dale",
        "go down", "move down", "page down", "roll down",
      ])) {
        const reply = "Scrolling down.";
        speak(reply); addMsg("bot", reply);
        window.scrollBy({ top: 400, behavior: "smooth" });
        return true;
      }
      if (fuzzyMatch(c, [
        "scroll up", "scroll page up", "school up", "stroll up", "scroll cup",
        "go up", "move up", "page up", "roll up",
      ])) {
        const reply = "Scrolling up.";
        speak(reply); addMsg("bot", reply);
        window.scrollBy({ top: -400, behavior: "smooth" });
        return true;
      }
    }
    if (settings.allowAuthActions) {
      if (fuzzyMatch(c, [
        "logout", "log me out", "log out", "sign out", "log off",
        "lock out", "law got", "logged out", "lock me out", "sign me out",
      ])) {
        const reply = "Logging you out. Goodbye!";
        addMsg("bot", reply);
        speak(reply, () => {
          localStorage.removeItem("subsync_token");
          window.dispatchEvent(new Event("storage"));
          stopListening();
          router.push("/");
        });
        return true;
      }
    }

    // ── MUTE ────────────────────────────────────────────────────────────────
    if (fuzzyMatch(c, [
      "mute", "be quiet", "stop talking", "silence", "shut up",
      "moot", "be quite", "stop talk", "silent", "quiet now",
    ])) {
      cancelSpeech(); setMuted(true); setIsMutedLocal(true);
      return true;
    }
    if (isMutedLocal && fuzzyMatch(c, [
      "unmute", "start talking", "enable voice", "speak again",
      "on mute", "un moot", "start talk", "enable voices", "speak again please",
    ])) {
      setMuted(false); setIsMutedLocal(false);
      playChime("on");
      speak("I'm back. How can I help?");
      addMsg("bot", "I'm back. How can I help?");
      return true;
    }

    // ── SLEEP ────────────────────────────────────────────────────────────────
    if (fuzzyMatch(c, [
      "go to sleep", "sleep", "deactivate", "shut down", "stop listening",
      "go sleep", "go to slip", "sleep now", "stop listen", "stand down",
    ])) {
      const reply = "Going to sleep. Say SyncBot to wake me.";
      speak(reply); addMsg("bot", reply);
      setTimeout(() => setActiveListening(false), 800);
      return true;
    }

    // ── HELP ─────────────────────────────────────────────────────────────────
    if (fuzzyMatch(c, [
      "help", "what can you do", "show commands", "commands", "show guide",
      "health", "what can do", "show command", "voice commands", "guide",
    ])) {
      const reply = "Here's everything I can do.";
      speak(reply); addMsg("bot", reply);
      setShowGuide(true);
      return true;
    }

    // ── SETTINGS ─────────────────────────────────────────────────────────────
    if (fuzzyMatch(c, [
      "settings", "open settings", "show settings", "configure",
      "setting", "open setting", "show setting", "config your", "preferences",
    ])) {
      const reply = "Opening my settings.";
      speak(reply); addMsg("bot", reply);
      setShowSettings(true);
      return true;
    }

    // ── APPS (Strict Local Matcher) ───────────────────────────────────────────
    if (settings.allowOpenApps) {
      for (const app of APPS) {
        const appPatterns = app.names.flatMap((name) => [
          name,
          `open ${name}`,
          `launch ${name}`,
          `start ${name}`,
          `run ${name}`,
          `go to ${name}`,
          `show ${name}`,
          `load ${name}`,
        ]);

        if (fuzzyMatch(c, appPatterns)) {
          const reply = `Opening ${app.label} now.`;
          addMsg("bot", reply);
          speak(reply);
          window.open(app.url, "_blank");
          return true;
        }
      }
    }

    // ── CLOSE MODAL ──────────────────────────────────────────────────────────
    if (fuzzyMatch(c, [
      "close", "dismiss", "exit modal", "close modal",
      "clothes", "closed", "dismissed", "exit model", "close model",
    ])) {
      window.dispatchEvent(new Event("syncbot:close-modal"));
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      const reply = "Closed."; speak(reply); addMsg("bot", reply); return true;
    }

    // ── CLICK BY VOICE ────────────────────────────────────────────────────────
    if (settings.allowClickButtons) {
      const clickMatch = c.match(/(?:click|press|tap|select)\s+(.+)/);
      if (clickMatch) {
        const target = clickMatch[1].trim().toLowerCase();
        const els = Array.from(document.querySelectorAll<HTMLElement>(
          "button, a, [role='button']"
        ));
        const match = els.find((el) => {
          const text  = (el.textContent ?? "").toLowerCase().trim();
          const aria  = (el.getAttribute("aria-label") ?? "").toLowerCase();
          return text.includes(target) || aria.includes(target);
        });
        if (match) {
          match.click();
          const reply = `Clicked ${match.textContent?.trim() || target}.`;
          speak(reply); addMsg("bot", reply);
        } else {
          const reply = `I couldn't find "${target}" to click.`;
          speak(reply); addMsg("bot", reply);
        }
        return true;
      }
    }

    return false; // Not handled locally
  }, [settings, speak, cancelSpeech, setMuted, setActiveListening, addMsg, isMutedLocal, router, stopListening]);

  // ── Register wake-word handler ───────────────────────────────────────────────
  useEffect(() => {
    setOnWakeWord(() => {
      const { name } = getUserInfo();
      const greeting = `Welcome ${name}, I am SyncBot, how can I help today?`;
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

  // ── Register command handler ─────────────────────────────────────────────────
  useEffect(() => {
    setOnCommand(async (cmd: string) => {
      const now = Date.now();
      if (cmd === lastCmdRef.current.text && now - lastCmdRef.current.time < 2500) {
        return;
      }
      lastCmdRef.current = { text: cmd, time: now };

      if (thinkRef.current) return;
      const lowConfidence = looksLowConfidence(cmd);
      const aiMessage = lowConfidence ? `[possibly misheard] ${cmd}` : cmd;
      addMsg("user", lowConfidence ? `${cmd} (?)` : cmd);

      if (!lowConfidence) {
        const handled = await handleLocalCommand(cmd);
        if (handled) return;
      }

      // Fallback to AI
      if (!settings.allowAI) {
        const reply = "I didn't catch that. Say help to see what I can do.";
        speak(reply); addMsg("bot", reply); return;
      }

      thinkRef.current = true;
      setIsThinking(true);

      const botMsgId = addMsg("bot", "");

      try {
        const { reply, action } = await askAI(aiMessage, (accumulated) => {
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
        const retryMsg = "I didn't quite catch that. Could you say it again?";
        speak(retryMsg);
        updateMsg(botMsgId, retryMsg);
      }
    });
  }, [setOnCommand, handleLocalCommand, askAI, executeAction, speak, addMsg, updateMsg, settings.allowAI, cleanStreamingText]);

  // ── Click pill handler ───────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    unlockSpeech(); // CRITICAL: unlock on user gesture
    if (activeListening) {
      playChime("off");
      setTimeout(() => speak("Going to sleep. Say SyncBot to wake me."), 150);
      setActiveListening(false);
    } else {
      playChime("on");
      setTimeout(() => speak("SyncBot online. How can I help?"), 150);
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
              onClick={() => { setMuted(!isMuted); setIsMutedLocal(!isMuted); }}
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
                Click to activate · Say &ldquo;SyncBot&rdquo; to wake
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
