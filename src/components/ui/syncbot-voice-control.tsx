"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, HelpCircle } from "lucide-react";
import { useVoiceCommand, playChime } from "@/hooks/useVoiceCommand";
import { SyncBotGuide } from "./syncbot-guide";

// ─── App registry ──────────────────────────────────────────────────────────────
const APPS = [
  { name: "trackersync", short: "tracker", url: "https://trackersync.sub-sync.ca",  label: "TrackerSync"  },
  { name: "travelsync",  short: "travel",  url: "https://travelsync.sub-sync.ca",   label: "TravelSync"   },
  { name: "brainsync",   short: "brain",   url: "https://brainsync.sub-sync.ca",    label: "BrainSync"    },
  { name: "seatsync",    short: "seat",    url: "https://seatsync.sub-sync.ca",     label: "SeatSync"     },
  { name: "photosync",   short: "photo",   url: "https://photosync.sub-sync.ca",    label: "PhotoSync"    },
  { name: "fluencysync", short: "fluency", url: "https://fluencysync.sub-sync.ca",  label: "FluencySync"  },
  { name: "steadysync",  short: "steady",  url: "https://steadysync.sub-sync.ca",   label: "SteadySync"   },
];

// ─── Fuzzy contains ────────────────────────────────────────────────────────────
function has(cmd: string, ...words: string[]): boolean {
  const c = cmd.toLowerCase();
  return words.some((w) => c.includes(w.toLowerCase()));
}

function pathLabel(p: string): string {
  if (p === "/")          return "the home page";
  if (p === "/dashboard") return "the dashboard";
  return p.replace(/^\//, "").replace(/-/g, " ");
}

// ─── Animated waveform bars ────────────────────────────────────────────────────
function Waveform() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
      {[0.5, 0.9, 0.6, 1.0, 0.7].map((h, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: "3px",
            borderRadius: "2px",
            background: "#FFD700",
            transformOrigin: "center",
            animation: `sb-bar ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.08}s`,
            height: `${12 * h}px`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Pulsing dot ───────────────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "block",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: color,
        animation: "sb-pulse 2s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function SyncBotVoiceControl() {
  const router   = useRouter();
  const pathname = usePathname();
  const [showGuide, setShowGuide] = useState(false);

  const {
    botState,
    isSupported,
    isMuted,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    setMuted,
    speak,
    cancelSpeech,
    repeatLastUtterance,
    onCommand,
  } = useVoiceCommand();

  // ── Toggle: click = on/off ──────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (botState === "idle") {
      playChime("on");
      startListening();
      speak("SyncBot online. How can I help?");
    } else {
      playChime("off");
      stopListening();
    }
  }, [botState, startListening, stopListening, speak]);

  // ── Command processor ───────────────────────────────────────────────────────
  const processCommand = useCallback(
    (cmd: string) => {
      if (!cmd) return;
      const c = cmd.toLowerCase().trim();

      // ── MUTE / UNMUTE (CRITICAL VOX TOGGLE) ──────────────────────────────────
      // If we are currently muted, we ONLY process the "unmute" command.
      if (isMuted) {
        if (has(c, "unmute", "stop muting", "enable voice", "start talking", "unmute voice", "unmute bot")) {
          setMuted(false);
          playChime("on");
          speak("SyncBot unmuted. Ready for commands.");
        }
        return; // Ignore everything else while muted!
      }

      // If not muted, we can process normal commands, including "mute".
      if (has(c, "mute", "stop talking", "be quiet", "silence", "mute voice", "mute bot")) {
        cancelSpeech();
        setMuted(true);
        // We do not speak a confirmation here because we just muted ourselves.
        return;
      }

      // ── CONTROL ─────────────────────────────────────────────────────────────
      if (has(c, "go to sleep", "stop listening", "sleep", "deactivate", "disable voice", "go sleep", "shut down", "shutdown")) {
        speak("Going to sleep. Click the icon to wake me.");
        setTimeout(() => stopListening(), 600);
        return;
      }
      if (has(c, "wake up", "start listening", "activate")) {
        speak("I'm already listening.");
        return;
      }
      if (has(c, "repeat that", "say that again", "repeat", "what did you say")) {
        repeatLastUtterance();
        return;
      }

      // ── GUIDE ────────────────────────────────────────────────────────────────
      if (has(c, "show guide", "show commands", "what can you do", "help", "commands", "open guide", "open commands")) {
        setShowGuide(true);
        speak("Here's everything I can do.");
        return;
      }

      // ── NAVIGATION ──────────────────────────────────────────────────────────
      if (has(c, "go home", "take me home", "go to home", "open home", "home page", "go to home page")) {
        speak("Taking you home.");
        router.push("/");
        return;
      }
      if (has(c, "dashboard", "go to dash", "open dash", "my dash", "go to dashboard", "open dashboard")) {
        speak("Opening your dashboard.");
        router.push("/dashboard");
        return;
      }

      // ── APPS ─────────────────────────────────────────────────────────────────
      for (const app of APPS) {
        if (has(c, app.name, app.short, `open ${app.name}`, `open ${app.short}`, `go to ${app.name}`, `go to ${app.short}`)) {
          speak(`Opening ${app.label} now.`);
          window.open(app.url, "_blank");
          return;
        }
      }

      // ── AUTH ─────────────────────────────────────────────────────────────────
      if (has(c, "log me out", "log out", "logout", "sign out", "signout")) {
        speak("Logging you out. Goodbye.");
        localStorage.removeItem("subsync_token");
        setTimeout(() => router.push("/"), 700);
        return;
      }
      if (has(c, "log in", "login", "sign in", "signin", "open login", "open sign in", "open signin", "open login modal", "show login")) {
        speak("Opening the login window.");
        window.dispatchEvent(new Event("syncbot:open-auth-modal"));
        return;
      }

      // ── SCROLL ──────────────────────────────────────────────────────────────
      if (has(c, "scroll to top", "go to top", "back to top", "top of page", "scroll top", "go top")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        speak("Scrolled to the top.");
        return;
      }
      if (has(c, "scroll to bottom", "go to bottom", "bottom of page", "end of page", "scroll bottom", "go bottom")) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        speak("Scrolled to the bottom.");
        return;
      }
      if (has(c, "scroll down", "page down", "move down", "scroll down page")) {
        window.scrollBy({ top: 400, behavior: "smooth" });
        speak("Scrolling down.");
        return;
      }
      if (has(c, "scroll up", "page up", "move up", "scroll up page")) {
        window.scrollBy({ top: -400, behavior: "smooth" });
        speak("Scrolling up.");
        return;
      }
      if (has(c, "scroll left", "carousel left", "previous", "slide left", "go left")) {
        window.dispatchEvent(new Event("syncbot:scroll-carousel-left"));
        speak("Scrolling left.");
        return;
      }
      if (has(c, "scroll right", "carousel right", "next", "slide right", "go right")) {
        window.dispatchEvent(new Event("syncbot:scroll-carousel-right"));
        speak("Scrolling right.");
        return;
      }

      // ── CLOSE MODAL ──────────────────────────────────────────────────────────
      if (has(c, "close", "dismiss", "cancel", "exit", "close modal", "dismiss modal", "hide modal")) {
        window.dispatchEvent(new Event("syncbot:close-modal"));
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
        );
        speak("Closed.");
        return;
      }

      // ── CLICK BUTTON (EXTREMELY ROBUST CLICK MATCHING) ───────────────────────
      const clickMatch = c.match(/(?:click|press|tap|select)\s+(.+)/);
      if (clickMatch) {
        const target = clickMatch[1].trim().toLowerCase();
        const elements = Array.from(
          document.querySelectorAll<HTMLElement>(
            "button, a, input[type='button'], input[type='submit'], [role='button'], [onClick]"
          )
        );
        let match = elements.find((el) => {
          const text = (el.textContent ?? "").toLowerCase().trim();
          const ariaLabel = (el.getAttribute("aria-label") ?? "").toLowerCase().trim();
          const title = (el.getAttribute("title") ?? "").toLowerCase().trim();
          const id = (el.id ?? "").toLowerCase().trim();
          return text.includes(target) || ariaLabel.includes(target) || title.includes(target) || id.includes(target);
        });

        // Fallback: search for any element with cursor pointer class or style if no match found
        if (!match) {
          const allElements = Array.from(document.querySelectorAll<HTMLElement>("*"));
          match = allElements.find((el) => {
            if (el.children.length > 3) return false; // skip large container divs
            const style = window.getComputedStyle(el);
            if (style.cursor !== "pointer") return false;
            const text = (el.textContent ?? "").toLowerCase().trim();
            return text && text.includes(target);
          });
        }

        if (match) {
          match.click();
          speak(`Clicked ${match.textContent?.trim() || target}.`);
        } else {
          speak(`I couldn't find anything matching "${target}" to click.`);
        }
        return;
      }

      // ── INFO ─────────────────────────────────────────────────────────────────
      if (has(c, "what page am i", "where am i", "current page", "what page", "which page")) {
        speak(`You are on ${pathLabel(pathname)}.`);
        return;
      }
      if (has(c, "list apps", "what apps", "show apps", "available apps", "which apps")) {
        speak("TrackerSync, TravelSync, BrainSync, SeatSync, PhotoSync, FluencySync, and SteadySync.");
        return;
      }
      if (has(c, "what time", "current time", "time is it", "what is the time")) {
        const now = new Date();
        speak(`It's ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.`);
        return;
      }
      if (has(c, "what day", "today's date", "what date", "current date", "what is today")) {
        const now = new Date();
        speak(
          `Today is ${now.toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
          })}.`
        );
        return;
      }

      // ── FALLBACK ─────────────────────────────────────────────────────────────
      if (c.length > 3) {
        speak("I didn't catch that. Try saying help to see all commands.");
      }
    },
    [pathname, router, speak, cancelSpeech, repeatLastUtterance, stopListening, setMuted, isMuted]
  );

  // Register the command handler
  useEffect(() => {
    onCommand(processCommand);
  }, [onCommand, processCommand]);

  // ── Inject keyframe CSS ─────────────────────────────────────────────────────
  useEffect(() => {
    const id = "syncbot-keyframes";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes sb-bar {
        from { transform: scaleY(0.25); }
        to   { transform: scaleY(1); }
      }
      @keyframes sb-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.25); }
      }
      @keyframes sb-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes sb-ring {
        0%   { transform: scale(1);    opacity: 0.5; }
        100% { transform: scale(1.8);  opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const isListening = botState === "listening";
  const isSpeaking  = botState === "speaking";
  const isActive    = isListening || isSpeaking;

  // ── Not supported fallback ──────────────────────────────────────────────────
  if (!isSupported && typeof window !== "undefined") {
    return (
      <div
        title="Voice control not supported in this browser"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "999px", padding: "9px 14px",
          display: "flex", alignItems: "center", gap: 8,
          backdropFilter: "blur(16px)",
        }}
      >
        <MicOff size={14} color="rgba(255,255,255,0.25)" />
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em" }}>
          SYNCBOT
        </span>
      </div>
    );
  }

  return (
    <>
      {/* ── Transcript bubble ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {(transcript || interimTranscript) && isActive && (
          <motion.div
            key="sb-transcript"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 6,  scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", bottom: 80, right: 24, zIndex: 9999,
              maxWidth: 280,
              background: "rgba(0,0,0,0.82)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,215,0,0.15)",
              borderRadius: 14, padding: "8px 14px",
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              {transcript || interimTranscript}
            </p>
            {interimTranscript && (
              <p style={{ color: "rgba(255,215,0,0.5)", fontSize: 11, margin: "2px 0 0" }}>
                listening…
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sonar ring (listening only) ────────────────────────────────────── */}
      {isListening && !isMuted && (
        <div
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9998,
            width: 48, height: 48, borderRadius: "50%",
            border: "2px solid rgba(255,215,0,0.35)",
            animation: "sb-ring 2s ease-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Help button next to main pill ──────────────────────────────────── */}
      <AnimatePresence>
        {isActive && (
          <motion.button
            key="sb-help-btn"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            onClick={() => setShowGuide(true)}
            title="Show commands reference"
            style={{
              position: "fixed", bottom: 24, right: isActive ? 180 : 130, zIndex: 9999,
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              backdropFilter: "blur(20px)",
              transition: "right 0.3s ease",
            }}
          >
            <HelpCircle size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Main pill button ───────────────────────────────────────────────── */}
      <motion.button
        onClick={handleClick}
        aria-label="SyncBot voice assistant"
        whileTap={{ scale: 0.92 }}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 10,
          padding: isActive ? "10px 18px" : "9px 15px",
          borderRadius: 999,
          background: isActive
            ? "rgba(0,0,0,0.92)"
            : "rgba(0,0,0,0.65)",
          border: `1px solid ${
            isListening && !isMuted
              ? "rgba(255,215,0,0.5)"
              : isSpeaking
              ? "rgba(255,215,0,0.35)"
              : "rgba(255,255,255,0.12)"
          }`,
          boxShadow: isActive
            ? "0 0 24px rgba(255,215,0,0.12), 0 4px 20px rgba(0,0,0,0.5)"
            : "0 2px 12px rgba(0,0,0,0.3)",
          backdropFilter: "blur(20px)",
          cursor: "pointer",
          userSelect: "none",
          transition: "padding 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Icon area */}
        {isSpeaking ? (
          <Volume2 size={15} color="#FFD700" style={{ animation: "sb-pulse 1s ease-in-out infinite" }} />
        ) : isListening && isMuted ? (
          <VolumeX size={15} color="rgba(255,100,100,0.8)" />
        ) : isListening ? (
          <Waveform />
        ) : (
          <Mic size={15} color="rgba(255,255,255,0.35)" />
        )}

        {/* Status dot + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isListening && !isMuted && <PulseDot color="#22c55e" />}
          {isListening && isMuted   && <PulseDot color="rgba(255,100,100,0.7)" />}
          <span
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isActive ? "#FFD700" : "rgba(255,215,0,0.55)",
            }}
          >
            {isSpeaking        ? "Speaking…"
             : isListening && isMuted ? "Muted"
             : isListening      ? "Listening"
             : "SyncBot"}
          </span>
        </div>
      </motion.button>

      {/* ── Guide modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showGuide && <SyncBotGuide onClose={() => setShowGuide(false)} />}
      </AnimatePresence>
    </>
  );
}
