# Hero Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-viewport split hero section with a dynamic canvas wave background, animated copy, and an interactive radial orbital diagram showing the 7 SubSync apps.

**Architecture:** `HeroSection` is a `'use client'` component that composes `HeroWave` (canvas animation) and `RadialOrbitalTimeline` (adapted orbital diagram) inside a two-column layout with an absolutely-positioned nav. All entrance animations use Framer Motion. The orbital component owns its own rotation state. Three scratch UI primitives (Badge, Button, Card) are built with `class-variance-authority` and served to the orbital component's expand-cards.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, Framer Motion v12, lucide-react, class-variance-authority, @radix-ui/react-slot, clsx, tailwind-merge

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/layout.tsx` | Modify | Load Poppins + DM Sans via next/font, inject CSS variables |
| `src/app/globals.css` | Modify | `@theme` font tokens, base body reset |
| `src/app/page.tsx` | Modify | Render `<HeroSection />` |
| `src/lib/utils.ts` | Create | `cn()` helper for className merging |
| `src/components/ui/badge.tsx` | Create | Scratch Badge — status indicators in orbital cards |
| `src/components/ui/button.tsx` | Create | Scratch Button — related-node links in orbital cards |
| `src/components/ui/card.tsx` | Create | Scratch Card — expand popup in orbital diagram |
| `src/components/ui/radial-orbital-timeline.tsx` | Create | Adapted orbital component with SubSync data + brand styling |
| `src/components/hero/HeroWave.tsx` | Create | Canvas pixel-shader wave animation |
| `src/components/hero/HeroSection.tsx` | Create | Full hero section — nav + split layout + app data |

---

### Task 1: Install npm dependencies

**Files:** none (shell only)

- [ ] **Step 1: Install the five packages**

```bash
npm install lucide-react class-variance-authority @radix-ui/react-slot clsx tailwind-merge
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Verify they appear in package.json**

```bash
npx tsc --version
```

Expected: TypeScript version printed (confirms toolchain is alive).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install hero section dependencies"
```

---

### Task 2: Configure fonts and global styles

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace layout.tsx with font-aware version**

```tsx
import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-poppins",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "SubSync",
  description: "SubSync Landing Page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSans.variable}`}>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Replace globals.css with @theme tokens**

```css
@import "tailwindcss";

@theme {
  --font-heading: var(--font-poppins), sans-serif;
  --font-body: var(--font-dm-sans), sans-serif;
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: load Poppins and DM Sans fonts via next/font"
```

---

### Task 3: Create utility helper and scratch UI primitives

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p "src/lib" "src/components/ui" "src/components/hero"
```

- [ ] **Step 2: Create src/lib/utils.ts**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Create src/components/ui/badge.tsx**

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700]",
        outline: "border-white/20 text-white/70",
        completed: "border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]",
        progress: "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
        pending: "border-white/20 bg-white/5 text-white/40",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

- [ ] **Step 4: Create src/components/ui/button.tsx**

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#FFD700] text-black hover:bg-[#ffe033]",
        outline:
          "border border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white",
        ghost: "bg-transparent text-white/70 hover:bg-white/10 hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-6 px-2 py-0",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

- [ ] **Step 5: Create src/components/ui/card.tsx**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-white/10 bg-black/85 text-white shadow-xl backdrop-blur-lg",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";
```

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/utils.ts src/components/ui/badge.tsx src/components/ui/button.tsx src/components/ui/card.tsx
git commit -m "feat: add cn helper and scratch UI primitives (Badge, Button, Card)"
```

---

### Task 4: Create HeroWave canvas component

**Files:**
- Create: `src/components/hero/HeroWave.tsx`

- [ ] **Step 1: Create src/components/hero/HeroWave.tsx**

```tsx
"use client";
import { useEffect, useRef } from "react";

export function HeroWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SCALE = 2;
    let width = 0;
    let height = 0;
    let imageData: ImageData;
    let data: Uint8ClampedArray;
    let animId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      width = Math.floor(canvas.width / SCALE);
      height = Math.floor(canvas.height / SCALE);
      imageData = ctx.createImageData(width, height);
      data = imageData.data;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const startTime = Date.now();

    const SIN_TABLE = new Float32Array(1024);
    const COS_TABLE = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const angle = (i / 1024) * Math.PI * 2;
      SIN_TABLE[i] = Math.sin(angle);
      COS_TABLE[i] = Math.cos(angle);
    }

    const fastSin = (x: number): number => {
      let norm = x % (Math.PI * 2);
      if (norm < 0) norm += Math.PI * 2;
      const index = Math.floor((norm / (Math.PI * 2)) * 1024) & 1023;
      return SIN_TABLE[index];
    };

    const fastCos = (x: number): number => {
      let norm = x % (Math.PI * 2);
      if (norm < 0) norm += Math.PI * 2;
      const index = Math.floor((norm / (Math.PI * 2)) * 1024) & 1023;
      return COS_TABLE[index];
    };

    const render = () => {
      const time = (Date.now() - startTime) * 0.001;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const u_x = (2 * x - width) / height;
          const u_y = (2 * y - height) / height;

          let a = 0;
          let d = 0;
          for (let i = 0; i < 4; i++) {
            a += fastCos(i - d + time * 0.5 - a * u_x);
            d += fastSin(i * u_y + a);
          }

          const wave = (fastSin(a) + fastCos(d)) * 0.5;
          const intensity = 0.3 + 0.4 * wave;
          const baseVal = 0.1 + 0.15 * fastCos(u_x + u_y + time * 0.3);
          const blueAccent = 0.2 * fastSin(a * 1.5 + time * 0.2);
          const purpleAccent = 0.15 * fastCos(d * 2 + time * 0.1);

          const r = Math.max(0, Math.min(1, baseVal + purpleAccent * 0.8)) * intensity;
          const g = Math.max(0, Math.min(1, baseVal + blueAccent * 0.6)) * intensity;
          const b =
            Math.max(0, Math.min(1, baseVal + blueAccent * 1.2 + purpleAccent * 0.4)) *
            intensity;

          const idx = (y * width + x) * 4;
          data[idx] = r * 255;
          data[idx + 1] = g * 255;
          data[idx + 2] = b * 255;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/hero/HeroWave.tsx
git commit -m "feat: add HeroWave canvas animation component"
```

---

### Task 5: Create RadialOrbitalTimeline component

**Files:**
- Create: `src/components/ui/radial-orbital-timeline.tsx`

This is the adapted version of the provided component. Key changes from the original:
- `TimelineItem` gains a `color: string` field
- Center core uses gold gradient instead of purple-blue-teal
- Node circles use `item.color` for border and background tint
- Expanded cards use SubSync glass styling
- Wrapper background changed to transparent (wave shows through)
- `transition-all` replaced with `transition-[transform,opacity]`
- `viewMode` and `centerOffset` state removed (not needed for hero use)
- `getStatusStyles` replaced with `getStatusVariant` / `getStatusLabel` to match our Badge variants

- [ ] **Step 1: Create src/components/ui/radial-orbital-timeline.tsx**

```tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  color: string;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const getRelatedItems = (itemId: number): number[] => {
    const item = timelineData.find((i) => i.id === itemId);
    return item ? item.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) newState[parseInt(key)] = false;
      });
      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const newPulse: Record<number, boolean> = {};
        getRelatedItems(id).forEach((relId) => {
          newPulse[relId] = true;
        });
        setPulseEffect(newPulse);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return newState;
    });
  };

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, zIndex, opacity };
  };

  const getStatusVariant = (
    status: TimelineItem["status"]
  ): "completed" | "progress" | "pending" => {
    if (status === "completed") return "completed";
    if (status === "in-progress") return "progress";
    return "pending";
  };

  const getStatusLabel = (status: TimelineItem["status"]): string => {
    if (status === "completed") return "COMPLETE";
    if (status === "in-progress") return "IN PROGRESS";
    return "PENDING";
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{ perspective: "1000px" }}
        >
          {/* Gold Sync Core */}
          <div
            className="absolute w-16 h-16 rounded-full animate-pulse flex items-center justify-center z-10"
            style={{ background: "radial-gradient(circle, #FFD700, #B8860B)" }}
          >
            <div className="absolute w-20 h-20 rounded-full border border-[#FFD700]/30 animate-ping opacity-70" />
            <div
              className="absolute w-24 h-24 rounded-full border border-[#FFD700]/15 animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            />
            <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center">
              <span className="text-[7px] font-black text-[#FFD700] leading-tight text-center font-heading">
                Sync
                <br />
                Core
              </span>
            </div>
          </div>

          {/* Orbit ring */}
          <div className="absolute w-96 h-96 rounded-full border border-white/10" />

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute transition-[transform,opacity] duration-700 cursor-pointer"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Glow aura */}
                <div
                  className={`absolute rounded-full ${isPulsing ? "animate-pulse" : ""}`}
                  style={{
                    background: `radial-gradient(circle, ${item.color}33 0%, transparent 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                />

                {/* Node circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-[transform,box-shadow] duration-300 ${
                    isRelated ? "animate-pulse" : ""
                  }`}
                  style={{
                    backgroundColor: isExpanded ? item.color : `${item.color}33`,
                    borderColor: isRelated ? item.color : `${item.color}80`,
                    color: isExpanded ? "#000" : "#fff",
                    transform: isExpanded ? "scale(1.5)" : "scale(1)",
                    boxShadow: isExpanded ? `0 0 20px ${item.color}60` : "none",
                  }}
                >
                  <Icon size={16} />
                </div>

                {/* Label */}
                <div
                  className="absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-[color,transform] duration-300"
                  style={{
                    color: isExpanded ? item.color : "rgba(255,255,255,0.7)",
                    left: "50%",
                    transform: `translateX(-50%) ${isExpanded ? "scale(1.25)" : "scale(1)"}`,
                  }}
                >
                  {item.title}
                </div>

                {/* Expanded card */}
                {isExpanded && (
                  <Card
                    className="absolute top-20 left-1/2 -translate-x-1/2 w-64 overflow-visible"
                    style={{ borderColor: `${item.color}40` }}
                  >
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3"
                      style={{ background: item.color }}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant={getStatusVariant(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                        <span className="text-xs font-mono text-white/50">{item.date}</span>
                      </div>
                      <CardTitle
                        className="text-sm mt-2"
                        style={{ color: item.color }}
                      >
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-white/80">
                      <p>{item.content}</p>

                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="flex items-center gap-1 text-white/50">
                            <Zap size={10} />
                            Sync Level
                          </span>
                          <span className="font-mono text-white/70">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.energy}%`,
                              background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`,
                            }}
                          />
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <div className="flex items-center mb-2 gap-1">
                            <Link size={10} className="text-white/50" />
                            <h4 className="text-xs uppercase tracking-wider font-medium text-white/50">
                              Connected
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relId) => {
                              const relItem = timelineData.find((i) => i.id === relId);
                              return (
                                <Button
                                  key={relId}
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relId);
                                  }}
                                >
                                  {relItem?.title}
                                  <ArrowRight size={8} className="ml-1 text-white/50" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/radial-orbital-timeline.tsx
git commit -m "feat: add RadialOrbitalTimeline adapted for SubSync brand"
```

---

### Task 6: Create HeroSection component

**Files:**
- Create: `src/components/hero/HeroSection.tsx`

- [ ] **Step 1: Create src/components/hero/HeroSection.tsx**

```tsx
"use client";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Plane,
  Brain,
  Calendar,
  Camera,
  Mic,
  Shield,
} from "lucide-react";
import { HeroWave } from "./HeroWave";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const EASE = [0.16, 1, 0.3, 1] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  };
}

const APPS = [
  {
    id: 1,
    title: "TrackerSync",
    color: "#10B981",
    icon: TrendingUp,
    date: "Finance",
    content: "Your financial engine. Track every dollar, spot every pattern.",
    category: "Finance",
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "TravelSync",
    color: "#3B82F6",
    icon: Plane,
    date: "Travel",
    content:
      "Every trip, perfectly synced. Itineraries, bookings, memories — one place.",
    category: "Travel",
    relatedIds: [1, 5],
    status: "completed" as const,
    energy: 88,
  },
  {
    id: 3,
    title: "BrainSync",
    color: "#8B5CF6",
    icon: Brain,
    date: "Focus",
    content:
      "Focus, amplified. Deep work sessions powered by your personal rhythm.",
    category: "Focus",
    relatedIds: [1, 4],
    status: "in-progress" as const,
    energy: 72,
  },
  {
    id: 4,
    title: "SeatSync",
    color: "#F59E0B",
    icon: Calendar,
    date: "Scheduling",
    content:
      "Book your desk, your shift, your day. Workplace time-slot scheduling, simplified.",
    category: "Scheduling",
    relatedIds: [3, 6],
    status: "in-progress" as const,
    energy: 65,
  },
  {
    id: 5,
    title: "PhotoSync",
    color: "#EC4899",
    icon: Camera,
    date: "Memory",
    content: "Memories, beautifully organized. Every photo in context.",
    category: "Memory",
    relatedIds: [2, 7],
    status: "completed" as const,
    energy: 91,
  },
  {
    id: 6,
    title: "FluencySync",
    color: "#06B6D4",
    icon: Mic,
    date: "Voice",
    content: "Your voice, perfected. Language learning that feels natural.",
    category: "Voice",
    relatedIds: [4, 7],
    status: "in-progress" as const,
    energy: 58,
  },
  {
    id: 7,
    title: "SteadySync",
    color: "#FFD700",
    icon: Shield,
    date: "Access",
    content:
      "Stability at the core. One account, one subscription, all seven apps.",
    category: "Access",
    relatedIds: [5, 6],
    status: "completed" as const,
    energy: 100,
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Wave canvas — z-0 */}
      <HeroWave />

      {/* Left vignette — z-1 */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
        }}
      />

      {/* Navigation — z-10 */}
      <nav
        className="absolute top-0 left-0 right-0 z-10 h-16 flex items-center justify-between px-10 border-b border-white/[0.06]"
        style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span className="font-heading text-[22px] font-black text-[#FFD700] tracking-tight">
          SubSync
        </span>
        <div className="flex items-center gap-8">
          {["Apps", "Features", "Pricing"].map((link) => (
            <button
              key={link}
              className="font-body text-sm text-[#94A3B8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
            >
              {link}
            </button>
          ))}
        </div>
        <button className="font-heading text-sm font-bold bg-[#FFD700] text-black px-5 py-2 rounded-lg hover:bg-[#ffe033] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-transform duration-150">
          Get Started
        </button>
      </nav>

      {/* Main grid — z-2 */}
      <div className="relative z-[2] min-h-screen pt-16 grid grid-cols-2">
        {/* Left: hero copy */}
        <div className="flex flex-col justify-center pl-20 pr-8 gap-6">
          <motion.p
            className="font-body text-[11px] font-medium text-[#FFD700] uppercase tracking-[0.14em]"
            {...fadeUp(0.15)}
          >
            The Sync Core Ecosystem
          </motion.p>

          <div className="flex flex-col">
            <motion.h1
              className="font-heading font-black text-white leading-[0.95] tracking-[-0.03em]"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
              {...fadeUp(0.4)}
            >
              Seven apps. Onesync.
            </motion.h1>
            <motion.h1
              className="font-heading font-black text-[#FFD700] leading-[0.95] tracking-[-0.03em]"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
              {...fadeUp(0.6)}
            >
              Infinite possibility.
            </motion.h1>
          </div>

          <motion.p
            className="font-body font-light text-[#94A3B8] text-[16px] leading-[1.75] max-w-[440px]"
            {...fadeUp(1.2)}
          >
            SubSync isn&apos;t another app — it&apos;s a connected universe
            where travel, memory, and focus pulse through one intelligent Sync
            Core.
          </motion.p>

          <motion.div className="flex items-center gap-3" {...fadeUp(1.5)}>
            <button className="font-heading text-sm font-bold bg-[#FFD700] text-black px-7 py-3 rounded-lg hover:bg-[#ffe033] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-transform duration-150">
              Get Started
            </button>
            <button className="font-body text-sm text-white px-7 py-3 rounded-lg border border-white/20 hover:bg-white/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-transform duration-150">
              Explore the Apps →
            </button>
          </motion.div>
        </div>

        {/* Right: orbital diagram */}
        <div className="relative flex items-center justify-center overflow-visible">
          <RadialOrbitalTimeline timelineData={APPS} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/hero/HeroSection.tsx
git commit -m "feat: add HeroSection with split layout and Framer Motion entrance animations"
```

---

### Task 7: Wire up page.tsx and verify

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace src/app/page.tsx**

```tsx
import { HeroSection } from "@/components/hero/HeroSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
```

- [ ] **Step 2: Type-check and lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no errors, no lint warnings.

- [ ] **Step 3: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- [ ] Wave canvas animation plays and fills the background
- [ ] Nav bar visible with SubSync logo in gold, three nav links, Get Started button
- [ ] Left column: eyebrow text in gold, two headline lines (white + gold), subhead in slate, two CTA buttons
- [ ] Entrance animations fire in sequence on page load
- [ ] Right column: orbit diagram visible with gold Sync Core, 7 colored app nodes rotating slowly
- [ ] Clicking a node stops rotation, expands a glass card showing app name, description, sync level bar, and connected app buttons
- [ ] Clicking the background resumes rotation and closes the card

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up HeroSection to page root"
```
