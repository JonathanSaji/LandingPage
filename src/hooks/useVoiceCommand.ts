"use client";

import { useRef, useState, useCallback, useEffect } from "react";

// ─── Web Speech API type declarations ─────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }

  interface SpeechRecognitionInstance {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
    onerror:  ((event: SpeechRecognitionErrEvent) => void) | null;
    onend:    (() => void) | null;
    onstart:  (() => void) | null;
  }

  interface SpeechRecognitionResultEvent {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────────
export type BotState = "idle" | "listening" | "speaking";

export interface VoiceCommandHook {
  botState: BotState;
  isSupported: boolean;
  isMuted: boolean;
  transcript: string;
  lastCommand: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  setMuted: (v: boolean) => void;
  speak: (text: string) => void;
  cancelSpeech: () => void;
  lastUtterance: string;
  repeatLastUtterance: () => void;
  onCommand: (handler: (cmd: string) => void) => void;
}

// ─── Web Audio activation chime ────────────────────────────────────────────────
export function playChime(type: "on" | "off" = "on"): void {
  try {
    const ctx = new AudioContext();
    const notes = type === "on" ? [660, 880, 1100] : [880, 660, 440];
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.25);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // AudioContext unavailable – silent fail
  }
}

// ─── Female voice selection ─────────────────────────────────────────────────────
function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) =>
      ["samantha", "karen", "victoria", "moira", "fiona", "female"].some((kw) =>
        v.name.toLowerCase().includes(kw)
      )
    ) ?? voices[0] ?? null
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useVoiceCommand(): VoiceCommandHook {
  const [botState,   setBotState]   = useState<BotState>("idle");
  const [isSupported, setIsSupported] = useState(false);
  const [isMuted,    setMutedState] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState("");
  const [lastUtterance, setLastUtterance] = useState("");

  const recRef         = useRef<SpeechRecognitionInstance | null>(null);
  const shouldRunRef   = useRef(false);
  const isMutedRef     = useRef(false);
  const botStateRef    = useRef<BotState>("idle");
  const commandHandler = useRef<((cmd: string) => void) | null>(null);
  const transcriptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync
  useEffect(() => { botStateRef.current = botState; }, [botState]);
  useEffect(() => { isMutedRef.current = isMuted; },   [isMuted]);

  // ── Register command handler ────────────────────────────────────────────────
  const onCommand = useCallback((handler: (cmd: string) => void) => {
    commandHandler.current = handler;
  }, []);

  // ── Speech synthesis ────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isMutedRef.current) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate   = 1.0;
    utter.pitch  = 1.05;
    utter.volume = 1.0;

    const tryVoice = () => {
      const v = pickVoice();
      if (v) utter.voice = v;
    };
    if (window.speechSynthesis.getVoices().length > 0) tryVoice();
    else window.speechSynthesis.onvoiceschanged = tryVoice;

    utter.onstart = () => setBotState("speaking");
    utter.onend   = () => setBotState(shouldRunRef.current ? "listening" : "idle");
    utter.onerror = () => setBotState(shouldRunRef.current ? "listening" : "idle");

    setLastUtterance(text);
    window.speechSynthesis.speak(utter);
  }, []);

  const cancelSpeech = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setBotState(shouldRunRef.current ? "listening" : "idle");
  }, []);

  const repeatLastUtterance = useCallback(() => {
    if (lastUtterance) speak(lastUtterance);
  }, [lastUtterance, speak]);

  const setMuted = useCallback((v: boolean) => {
    isMutedRef.current = v;
    setMutedState(v);
    if (v) window.speechSynthesis?.cancel();
  }, []);

  // ── Build recognition instance ──────────────────────────────────────────────
  const buildRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
    if (!SR) return null;

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onstart = () => setBotState("listening");

    rec.onresult = (event: SpeechRecognitionResultEvent) => {
      let interim = "";
      let final   = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }

      // Show interim in real time
      if (interim) setInterimTranscript(interim.trim());

      if (final) {
        const cmd = final.trim().toLowerCase();
        setTranscript(cmd);
        setInterimTranscript("");
        setLastCommand(cmd);

        // Auto-clear transcript display after 4s
        if (transcriptTimer.current) clearTimeout(transcriptTimer.current);
        transcriptTimer.current = setTimeout(() => {
          setTranscript("");
        }, 4000);

        // Fire the command handler
        commandHandler.current?.(cmd);
      }
    };

    rec.onerror = (event: SpeechRecognitionErrEvent) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        console.warn("[SyncBot] Microphone permission denied.");
        shouldRunRef.current = false;
        setBotState("idle");
      }
      // For "no-speech" and "aborted" — let onend handle restart
    };

    rec.onend = () => {
      // Auto-restart if we're still supposed to be running
      if (shouldRunRef.current) {
        try { rec.start(); } catch { /* already restarting */ }
      } else {
        setBotState("idle");
      }
    };

    return rec;
  }, []);

  // ── Start listening ─────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (shouldRunRef.current) return; // already running
    shouldRunRef.current = true;

    if (!recRef.current) {
      recRef.current = buildRecognition();
    }
    if (!recRef.current) {
      console.warn("[SyncBot] SpeechRecognition not supported.");
      return;
    }

    setBotState("listening");
    try { recRef.current.start(); } catch { /* already started */ }
  }, [buildRecognition]);

  // ── Stop listening ──────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    shouldRunRef.current = false;
    recRef.current?.stop();
    window.speechSynthesis?.cancel();
    setBotState("idle");
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // ── Browser support check ───────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported(!!(window.SpeechRecognition ?? window.webkitSpeechRecognition));
    }
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      shouldRunRef.current = false;
      recRef.current?.stop();
      if (transcriptTimer.current) clearTimeout(transcriptTimer.current);
    };
  }, []);

  return {
    botState,
    isSupported,
    isMuted,
    transcript,
    interimTranscript,
    lastCommand,
    startListening,
    stopListening,
    setMuted,
    speak,
    cancelSpeech,
    lastUtterance,
    repeatLastUtterance,
    onCommand,
  };
}
