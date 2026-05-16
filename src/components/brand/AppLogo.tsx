"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const sizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  hero: 120,
} as const;

type AppLogoSize = keyof typeof sizes;

interface AppLogoProps {
  size?: AppLogoSize;
  className?: string;
  /** Subtle breathing glow — great for hero / sync core */
  glow?: boolean;
  /** Slow rotation — use on decorative placements */
  animate?: boolean;
  priority?: boolean;
}

export function AppLogo({
  size = "md",
  className,
  glow = false,
  animate = false,
  priority = false,
}: AppLogoProps) {
  const reduceMotion = useReducedMotion();
  const px = sizes[size];

  const image = (
    <Image
      src="/logo.png"
      alt="SubSync"
      width={px}
      height={px}
      priority={priority}
      className={cn("relative z-10 h-auto w-full object-contain", className)}
    />
  );

  if (!glow && !animate) {
    return (
      <span
        className={cn("relative inline-flex shrink-0 items-center justify-center")}
        style={{ width: px, height: px }}
      >
        {image}
      </span>
    );
  }

  return (
    <motion.span
      className={cn("relative inline-flex shrink-0 items-center justify-center")}
      style={{ width: px, height: px }}
      animate={
        reduceMotion || !animate
          ? undefined
          : { rotate: [0, 3, -3, 0], scale: [1, 1.03, 1] }
      }
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      {glow && (
        <motion.span
          className="absolute inset-[-20%] rounded-full bg-honey/25 blur-xl"
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.35, 0.7, 0.35], scale: [0.9, 1.1, 0.9] }
          }
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {image}
    </motion.span>
  );
}

interface AppLogoLockupProps {
  className?: string;
  showWordmark?: boolean;
  logoSize?: AppLogoSize;
}

/** Logo + SubSync wordmark — nav, footer, hero */
export function AppLogoLockup({
  className,
  showWordmark = true,
  logoSize = "sm",
}: AppLogoLockupProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex items-center justify-center rounded-xl glass-pill p-1">
        <AppLogo size={logoSize} glow />
      </span>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-pearl">
          Sub<span className="text-honey">Sync</span>
        </span>
      )}
    </span>
  );
}
