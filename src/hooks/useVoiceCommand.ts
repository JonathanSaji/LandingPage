"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ─── Web Speech API type shims ─────────────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: new () => SR;
    webkitSpeechRecognition: new () => SR;
  }
}
interface SR {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SRResultEvent) => void) | null;
  onerror:  ((e: SRErrorEvent)  => void) | null;
  onend:    (() => void) | null;
  onstart:  (() => void) | null;
}
interface SRResultEvent {
  resultIndex: number;
  results: { length: number; [i: number]: { isFinal: boolean; length: number; [j: number]: { transcript: string; confidence?: number } } };
}
interface SRErrorEvent extends Event { error: string }

// ─── Types ─────────────────────────────────────────────────────────────────────
export type BotState = "idle" | "sleeping" | "listening" | "thinking" | "speaking";

export interface VoiceCommandHook {
  botState:          BotState;
  isSupported:       boolean;
  isMuted:           boolean;
  transcript:        string;
  candidates:        Array<{ text: string; confidence: number }>;
  interimTranscript: string;
  activeListening:   boolean;
  startListening:    () => void;
  stopListening:     () => void;
  setActiveListening:(v: boolean) => void;
  setMuted:          (v: boolean) => void;
  speak:             (text: string, onDone?: () => void) => void;
  cancelSpeech:      () => void;
  unlockSpeech:      () => void;
  setOnWakeWord:     (fn: () => void) => void;
  setOnCommand:      (fn: (cmd: string) => void) => void;
}

// ─── Wake word engine ─────────────────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
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

function soundex(word: string): string {
  const s = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (!s) return "";
  const map: Record<string, string> = {
    B: "1", F: "1", P: "1", V: "1",
    C: "2", G: "2", J: "2", K: "2", Q: "2", S: "2", X: "2", Z: "2",
    D: "3", T: "3", L: "4", M: "5", N: "5", R: "6",
  };
  let code = s[0];
  let prev = map[s[0]] ?? "0";
  for (let i = 1; i < s.length && code.length < 4; i++) {
    const curr = map[s[i]] ?? "0";
    if (curr !== "0" && curr !== prev) code += curr;
    prev = curr;
  }
  return code.padEnd(4, "0");
}

const SYNC_CODES = ["S520", "S200", "S500"];
const BOT_CODES = ["B300", "B000"];

function isWakeWord(transcript: string): boolean {
  const words = transcript.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);

  for (const word of words) {
    if (word.length > 5) {
      const code = soundex(word);
      if (SYNC_CODES.some((c) => code.startsWith(c[0]) && levenshtein(code, c) <= 1)) return true;
    }
  }

  for (let i = 0; i < words.length - 1; i++) {
    const a = soundex(words[i]);
    const b = soundex(words[i + 1]);
    const syncMatch = SYNC_CODES.some((c) => levenshtein(a, c) <= 1);
    const botMatch = BOT_CODES.some((c) => levenshtein(b, c) <= 1);
    if (syncMatch && botMatch) return true;
  }

  const t = transcript.toLowerCase();
  return ["syncbot", "sync bot", "hey sync", "sinkbot", "sink bot"].some((p) => t.includes(p));
}

// ─── Audio chime ───────────────────────────────────────────────────────────────
export function playChime(type: "on" | "off" = "on"): void {
  try {
    const ctx   = new AudioContext();
    const notes = type === "on" ? [660, 880, 1100] : [880, 660, 440];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t); osc.stop(t + 0.25);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch { /* silent fail */ }
}

// ─── Voice picker ──────────────────────────────────────────────────────────────
function getBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  // Prefer Google US English, then native US voices, then Samantha, then any English
  return (
    voices.find((v) => v.name === "Google US English") ??
    voices.find((v) => v.lang === "en-US" && v.localService) ??
    voices.find((v) => v.name.toLowerCase().includes("samantha")) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    voices[0] ?? null
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useVoiceCommand(): VoiceCommandHook {
  const [botState,          setBotState]          = useState<BotState>("idle");
  const [isSupported,       setIsSupported]        = useState(false);
  const [isMuted,           setIsMutedState]       = useState(false);
  const [transcript,        setTranscript]         = useState("");
  const [candidates,        setCandidates]         = useState<Array<{ text: string; confidence: number }>>([]);
  const [interimTranscript, setInterimTranscript]  = useState("");
  const [activeListening,   setActiveListeningState] = useState(false);

  // ── Stable refs (never stale in SR callbacks) ──────────────────────────────
  const recRef          = useRef<SR | null>(null);
  const shouldRunRef    = useRef(false);
  const isMutedRef      = useRef(false);
  const activeRef       = useRef(false);
  const unlockedRef     = useRef(false);
  const speakingRef     = useRef(false);
  const activeUtterRef  = useRef<SpeechSynthesisUtterance | null>(null); // prevent garbage collection bug
  const onWakeRef       = useRef<(() => void) | null>(null);
  const onCmdRef        = useRef<((cmd: string) => void) | null>(null);
  const wakeDebounce    = useRef(false);
  const transcriptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voicesLoaded    = useRef(false);

  // ── Setters for external callbacks ────────────────────────────────────────
  const setOnWakeWord = useCallback((fn: () => void) => { onWakeRef.current = fn; }, []);
  const setOnCommand  = useCallback((fn: (cmd: string) => void) => { onCmdRef.current = fn; }, []);

  // ── Raw speak (bypasses unlock gate — call only after unlock) ─────────────
  const _rawSpeak = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isMutedRef.current) { onDone?.(); return; }

    speakingRef.current = true;

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      console.warn("[SyncBot] cancel/resume failed", e);
    }

    // Wrap in a 50ms delay to prevent Chrome's async cancel() from swallowing the new speak request
    setTimeout(() => {
      if (isMutedRef.current) {
        speakingRef.current = false;
        onDone?.();
        return;
      }

      const utter = new SpeechSynthesisUtterance(text);
      activeUtterRef.current = utter; // Keep reference to prevent GC

      const speed = parseFloat(localStorage.getItem("syncbot_speed") ?? "1.0");
      utter.rate   = speed;
      utter.pitch  = 1.05;
      utter.volume = 1.0;

      const apply = () => {
        const v = getBestVoice();
        if (v) utter.voice = v;
        speakingRef.current = true;
        setBotState("speaking");
        try {
          window.speechSynthesis.speak(utter);
        } catch (err) {
          console.error("[SyncBot] speak execution failed:", err);
          speakingRef.current = false;
          if (activeUtterRef.current === utter) activeUtterRef.current = null;
          onDone?.();
        }
      };

      utter.onend   = () => {
        if (activeUtterRef.current === utter) {
          activeUtterRef.current = null;
          speakingRef.current = false;
          setBotState(activeRef.current ? "listening" : "sleeping");
          onDone?.();
        }
      };
      utter.onerror = (e) => {
        console.warn("[SyncBot] Speech synthesis error:", e);
        if (activeUtterRef.current === utter) {
          activeUtterRef.current = null;
          speakingRef.current = false;
          setBotState(activeRef.current ? "listening" : "sleeping");
          onDone?.();
        }
      };

      if (voicesLoaded.current) {
        apply();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          voicesLoaded.current = true;
          window.speechSynthesis.onvoiceschanged = null;
          apply();
        };
        // Fallback after 400ms if event never fires
        setTimeout(() => {
          if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) apply();
        }, 400);
      }
    }, 50);
  }, []);

  // ── Public speak ──────────────────────────────────────────────────────────
  const speak = useCallback((text: string, onDone?: () => void) => {
    _rawSpeak(text, onDone);
  }, [_rawSpeak]);

  // ── Unlock speech synthesis ────────────────────────────────────────────────
  // Browsers block speechSynthesis.speak() until the user has interacted.
  // We fire a silent zero-volume utterance on the first user gesture to
  // permanently unlock the audio context for all future speak() calls.
  const unlockSpeech = useCallback(() => {
    if (unlockedRef.current) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    unlockedRef.current = true;

    // Pre-load voices
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) voicesLoaded.current = true;

    // Fire a silent utterance to unlock the audio context
    try {
      const silent = new SpeechSynthesisUtterance(" ");
      silent.volume = 0;
      window.speechSynthesis.speak(silent);
    } catch (e) {
      console.warn("[SyncBot] Silent speak for unlock failed", e);
    }
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    speakingRef.current = false;
    setBotState(activeRef.current ? "listening" : "sleeping");
  }, []);

  const setMuted = useCallback((v: boolean) => {
    isMutedRef.current = v;
    setIsMutedState(v);
    if (v && typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
      speakingRef.current = false;
    }
  }, []);

  // ── Wake-word handler ─────────────────────────────────────────────────────
  const triggerWakeWord = useCallback(() => {
    if (wakeDebounce.current) return;
    wakeDebounce.current = true;
    setTimeout(() => { wakeDebounce.current = false; }, 3000);

    activeRef.current = true;
    setActiveListeningState(true);
    setBotState("listening");
    playChime("on");
    onWakeRef.current?.();
  }, []);

  // ── Build the SR instance once ────────────────────────────────────────────
  const buildRec = useCallback(() => {
    if (typeof window === "undefined") return null;
    const SRClass = window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
    if (!SRClass) return null;

    const rec = new SRClass();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = "en-US";
    rec.maxAlternatives = 3;

    rec.onstart = () => setBotState(activeRef.current ? "listening" : "sleeping");

    rec.onresult = (e: SRResultEvent) => {
      if (speakingRef.current) {
        setInterimTranscript("");
        return;
      }

      let interim = "";
      let final_  = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final_ += t;
        else interim += t;
      }

      // ── SLEEPING: only care about wake word ──────────────────────────────
      if (!activeRef.current) {
        const lastResult = e.results[e.results.length - 1];
        for (let k = 0; k < lastResult.length; k++) {
          const alt = lastResult[k].transcript;
          if (isWakeWord(alt)) {
            triggerWakeWord();
            break;
          }
        }
        return;
      }

      // ── ACTIVE: show interim, process final ──────────────────────────────
      if (interim) setInterimTranscript(interim.trim());

      if (final_) {
        const lastResult = e.results[e.results.length - 1];
        const nextCandidates: Array<{ text: string; confidence: number }> = [];

        for (let k = 0; k < lastResult.length; k++) {
          const alt = lastResult[k];
          const text = alt.transcript.trim().toLowerCase();
          if (text) {
            nextCandidates.push({
              text,
              confidence: alt.confidence ?? (1 - k * 0.1),
            });
          }
        }

        const best = [...nextCandidates].sort((a, b) => b.confidence - a.confidence)[0]?.text ?? final_.trim().toLowerCase();
        const cmd = best.trim().toLowerCase();
        if (!cmd) return;

        setCandidates(nextCandidates);
        setTranscript(cmd);
        setInterimTranscript("");
        if (transcriptTimer.current) clearTimeout(transcriptTimer.current);
        transcriptTimer.current = setTimeout(() => setTranscript(""), 5000);

        onCmdRef.current?.(cmd);
      }
    };

    rec.onerror = (e: SRErrorEvent) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        shouldRunRef.current = false;
        setBotState("idle");
        setActiveListeningState(false);
        activeRef.current = false;
      }
      // aborted / no-speech / network → let onend restart
    };

    rec.onend = () => {
      if (!shouldRunRef.current) {
        setBotState("idle");
        return;
      }
      // Restart with small backoff
      if (restartTimer.current) clearTimeout(restartTimer.current);
      restartTimer.current = setTimeout(() => {
        try { rec.start(); } catch { /* already running */ }
      }, 200);
    };

    return rec;
  }, [triggerWakeWord]);

  // ── startListening / stopListening ────────────────────────────────────────
  const startListening = useCallback(() => {
    if (shouldRunRef.current) return;
    shouldRunRef.current = true;

    if (!recRef.current) recRef.current = buildRec();
    if (!recRef.current) { console.warn("[SyncBot] SR not supported"); return; }

    // Start in sleeping state
    activeRef.current = false;
    setActiveListeningState(false);
    setBotState("sleeping");

    try { recRef.current.start(); } catch { /* already started */ }
  }, [buildRec]);

  const stopListening = useCallback(() => {
    shouldRunRef.current = false;
    activeRef.current    = false;
    setActiveListeningState(false);
    setBotState("idle");
    setTranscript("");
    setCandidates([]);
    setInterimTranscript("");
    recRef.current?.stop();
  }, []);

  const setActiveListening = useCallback((v: boolean) => {
    activeRef.current = v;
    setActiveListeningState(v);
    setBotState(v ? "listening" : (shouldRunRef.current ? "sleeping" : "idle"));
  }, []);

  // ── Browser support & auto unlock on gesture ───────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported(!!(window.SpeechRecognition ?? window.webkitSpeechRecognition));
      // Pre-load voices
      const voices = window.speechSynthesis?.getVoices() ?? [];
      if (voices.length > 0) voicesLoaded.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const handleGesture = () => {
      unlockSpeech();
    };
    window.addEventListener("click", handleGesture, { passive: true });
    window.addEventListener("touchstart", handleGesture, { passive: true });
    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
    };
  }, [unlockSpeech]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => {
    shouldRunRef.current = false;
    recRef.current?.stop();
    if (transcriptTimer.current) clearTimeout(transcriptTimer.current);
    if (restartTimer.current)   clearTimeout(restartTimer.current);
  }, []);

  return {
    botState, isSupported, isMuted, transcript, candidates, interimTranscript, activeListening,
    startListening, stopListening, setActiveListening, setMuted,
    speak, cancelSpeech, unlockSpeech, setOnWakeWord, setOnCommand,
  };
}
