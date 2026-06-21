"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
  icon?: React.ElementType;
  logoSrc?: string;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  color: string;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

const SPEED = 6; // degrees per second

export function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [radius, setRadius] = useState(200);
  const radiusRef = useRef(200);

  useEffect(() => {
    const handleResize = () => {
      let r = 200;
      if (window.innerWidth < 480) {
        r = 110;
      } else if (window.innerWidth < 768) {
        r = 150;
      }
      setRadius(r);
      radiusRef.current = r;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  // Per-node DOM refs — RAF writes transforms directly, bypassing React re-renders
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const angleRef = useRef(0);
  const autoRotateRef = useRef(true);
  const expandedRef = useRef<Record<number, boolean>>({});
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  // While non-null, RAF lerps toward this angle instead of auto-rotating
  const targetAngleRef = useRef<number | null>(null);
  // True while lerping — expanded node moves with the orbit until it arrives
  const centeringRef = useRef(false);

  // RAF loop — only updates DOM directly, never triggers React re-renders
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current !== 0) {
        const delta = time - lastTimeRef.current;

        if (targetAngleRef.current !== null) {
          // Lerp toward target — shortest-path around the circle
          let diff = targetAngleRef.current - angleRef.current;
          diff = ((diff % 360) + 540) % 360 - 180;
          if (Math.abs(diff) > 0.15) {
            angleRef.current += diff * 0.1; // exponential deceleration
          } else {
            angleRef.current = targetAngleRef.current;
            targetAngleRef.current = null;
            centeringRef.current = false; // arrived — pin expanded node
          }
        } else if (autoRotateRef.current) {
          angleRef.current = (angleRef.current + (SPEED * delta) / 1000) % 360;
        }
      }
      lastTimeRef.current = time;

      nodeRefs.current.forEach((el, index) => {
        if (!el) return;
        const item = timelineData[index];
        const isExpanded = expandedRef.current[item?.id];
        // Pin expanded node only after lerp completes
        if (isExpanded && !centeringRef.current) return;

        const angle = ((index / timelineData.length) * 360 + angleRef.current) % 360;
        const radian = (angle * Math.PI) / 180;
        const x = radiusRef.current * Math.cos(radian);
        const y = radiusRef.current * Math.sin(radian);
        const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        el.style.transform = `translate(${x}px, ${y}px)`;
        // Expanded node always full opacity — never caught mid-fade
        el.style.opacity = isExpanded ? "1" : String(opacity);
        el.style.zIndex = isExpanded ? "200" : String(zIndex);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [timelineData]);

  const getRelatedItems = (itemId: number) =>
    timelineData.find((i) => i.id === itemId)?.relatedIds ?? [];

  const isRelatedToActive = (itemId: number) =>
    activeNodeId !== null && getRelatedItems(activeNodeId).includes(itemId);

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const opening = !prev[id];
      const next: Record<number, boolean> = {};
      if (opening) next[id] = true;
      expandedRef.current = next;

      if (opening) {
        // Animate orbit so clicked node swings to the top (270°)
        const nodeIndex = timelineData.findIndex((item) => item.id === id);
        targetAngleRef.current = 270 - (nodeIndex / timelineData.length) * 360;
        centeringRef.current = true; // node moves with orbit during lerp

        setActiveNodeId(id);
        autoRotateRef.current = false;
        const pulse: Record<number, boolean> = {};
        getRelatedItems(id).forEach((relId) => { pulse[relId] = true; });
        setPulseEffect(pulse);
      } else {
        setActiveNodeId(null);
        autoRotateRef.current = true;
        setPulseEffect({});
      }
      return next;
    });
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      expandedRef.current = {};
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      autoRotateRef.current = true;
    }
  };

  const getStatusVariant = (status: TimelineItem["status"]) =>
    status === "completed" ? "completed" : status === "in-progress" ? "progress" : "pending";

  const getStatusLabel = (status: TimelineItem["status"]) =>
    status === "completed" ? "COMPLETE" : status === "in-progress" ? "IN PROGRESS" : "PENDING";

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center overflow-visible"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
        >
          {/* Sync Core */}
          <div className="absolute w-16 h-16 rounded-full flex items-center justify-center z-10">
            <div className="absolute w-20 h-20 rounded-full border border-[#FFD700]/30 animate-ping opacity-70" />
            <div
              className="absolute w-24 h-24 rounded-full border border-[#FFD700]/15 animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            />
            <Image
              src="/logos/SubSync.png"
              alt="SubSync"
              width={64}
              height={64}
              className="rounded-full object-contain"
            />
          </div>

          {/* Orbit ring */}
          <div
            className="absolute rounded-full border border-white/10"
            style={{ width: radius * 2, height: radius * 2 }}
          />

          {timelineData.map((item, index) => {
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                // No CSS transition — RAF handles smooth motion
                ref={(el) => { nodeRefs.current[index] = el; }}
                className="absolute cursor-pointer"
                style={{ zIndex: isExpanded ? 200 : undefined }}
                onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden transition-[transform,box-shadow] duration-300 ${
                    isRelated ? "animate-pulse" : ""
                  }`}
                  style={{
                    backgroundColor: item.logoSrc ? "#000" : isExpanded ? item.color : `${item.color}33`,
                    borderColor: isRelated ? item.color : `${item.color}80`,
                    color: isExpanded ? "#000" : "#fff",
                    transform: isExpanded ? "scale(1.5)" : "scale(1)",
                    boxShadow: isExpanded ? `0 0 20px ${item.color}60` : "none",
                  }}
                >
                  {item.logoSrc ? (
                    <Image src={item.logoSrc} alt={item.title} width={40} height={40} className="object-contain w-full h-full" />
                  ) : Icon ? (
                    <Icon size={16} />
                  ) : null}
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
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3" style={{ background: item.color }} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant={getStatusVariant(item.status)}>{getStatusLabel(item.status)}</Badge>
                        <span className="text-xs font-mono text-white/50">{item.date}</span>
                      </div>
                      <CardTitle className="text-sm mt-2" style={{ color: item.color }}>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-white/80">
                      <p>{item.content}</p>
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="flex items-center gap-1 text-white/50"><Zap size={10} />Sync Level</span>
                          <span className="font-mono text-white/70">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${item.energy}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}80)` }}
                          />
                        </div>
                      </div>
                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <div className="flex items-center mb-2 gap-1">
                            <Link size={10} className="text-white/50" />
                            <h4 className="text-xs uppercase tracking-wider font-medium text-white/50">Connected</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relId) => {
                              const relItem = timelineData.find((i) => i.id === relId);
                              return (
                                <Button
                                  key={relId}
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); toggleItem(relId); }}
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
