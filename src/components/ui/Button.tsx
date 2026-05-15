"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { motion as motionTokens } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-iris text-pearl glow-iris border border-white/10 hover:border-white/20",
  secondary:
    "glass-panel text-pearl hover:bg-white/[0.06] border-white/10",
  ghost: "text-pearl-muted hover:text-pearl hover:bg-white/[0.04]",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={motionTokens.springSnappy}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
