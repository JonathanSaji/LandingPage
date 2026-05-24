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

export function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

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
