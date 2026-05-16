"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

interface TextScrambleProps {
  text: string;
  className?: string;
  duration?: number;
}

export function TextScramble({ text, className, duration = 1.2 }: TextScrambleProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduceMotion || !inView) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const totalFrames = Math.floor(duration * 60);
    const id = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const revealed = Math.floor(text.length * progress);

      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealed) return text[i];
            return CHARSET[Math.floor(Math.random() * CHARSET.length)];
          })
          .join(""),
      );
      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(id);
      }
    }, 1000 / 60);

    return () => clearInterval(id);
  }, [text, duration, inView, reduceMotion]);

  return (
    <motion.span ref={ref} className={cn("font-mono tracking-wider", className)}>
      {display}
    </motion.span>
  );
}
