"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easings } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface SplitTextRevealProps {
  text: string;
  className?: string;
  /** Split by "words" | "chars" */
  mode?: "words" | "chars";
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function SplitTextReveal({
  text,
  className,
  mode = "words",
  delay = 0,
  as: Tag = "h2",
}: SplitTextRevealProps) {
  const reduceMotion = useReducedMotion();
  const parts = mode === "words" ? text.split(" ") : text.split("");
  const MotionTag = motion[Tag];

  if (reduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <MotionTag
      className={cn("flex flex-wrap", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      style={{ perspective: 1000 }}
    >
      {parts.map((part, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", rotateX: -55, opacity: 0 },
              visible: {
                y: 0,
                rotateX: 0,
                opacity: 1,
                transition: {
                  duration: 0.75,
                  delay: delay + i * (mode === "chars" ? 0.03 : 0.06),
                  ease: easings.outExpo,
                },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {part}
            {mode === "words" && i < parts.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
