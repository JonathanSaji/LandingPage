"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AppLogo } from "@/components/brand/AppLogo";
import { products } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface NodePosition {
  [productId: string]: { x: number; y: number };
}

const ORBIT_RADIUS = 140;
const CONTAINER_SIZE = ORBIT_RADIUS * 2 + 80;
const NODE_SIZE = 48;

export function InteractiveEcosystemGraph() {
  const reduceMotion = useReducedMotion();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [nodePositions, setNodePositions] = useState<NodePosition>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialPositions: NodePosition = {};
    products.forEach((product, i) => {
      const angle = (360 / products.length) * i - 90;
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad) * ORBIT_RADIUS;
      const y = Math.sin(rad) * ORBIT_RADIUS;
      initialPositions[product.id] = { x, y };
    });
    setNodePositions(initialPositions);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProductId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId)
    : null;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
    >
      {/* Sync Core center */}
      <motion.div
        className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-full glass-card md:h-20 md:w-20"
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: [
                  "0 0 60px rgb(255 214 10 / 0.3)",
                  "0 0 100px rgb(255 229 102 / 0.45)",
                  "0 0 60px rgb(255 214 10 / 0.3)",
                ],
              }
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <AppLogo size="sm" glow animate />
      </motion.div>

      {/* Orbital nodes */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        {products.map((_, i) => {
          const angle = (360 / products.length) * i - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * (ORBIT_RADIUS / CONTAINER_SIZE) * 100;
          const y = 50 + Math.sin(rad) * (ORBIT_RADIUS / CONTAINER_SIZE) * 100;
          return (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${x}%`}
              y2={`${y}%`}
              stroke="rgba(255, 214, 10, 0.2)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {/* Product nodes */}
      {products.map((product) => {
        const position = nodePositions[product.id];
        if (!position) return null;

        const isSelected = selectedProductId === product.id;

        return (
          <motion.div
            key={product.id}
            layoutId={`product-node-${product.id}`}
            className="absolute"
            style={{
              x: position.x,
              y: position.y,
              width: NODE_SIZE,
              height: NODE_SIZE,
            }}
            drag={reduceMotion ? false : true}
            dragElastic={0.2}
            dragTransition={{ power: 0.3, restDelta: 0.001 }}
            onDrag={(event, info) => {
              setNodePositions((prev) => ({
                ...prev,
                [product.id]: {
                  x: position.x + info.delta.x,
                  y: position.y + info.delta.y,
                },
              }));
            }}
            onHoverStart={() => {
              if (!isSelected) setSelectedProductId(null);
            }}
          >
            <motion.button
              onClick={() => setSelectedProductId(product.id)}
              className={cn(
                "group relative flex h-full w-full items-center justify-center rounded-2xl glass-pill transition-colors",
                isSelected && "border-honey/50"
              )}
              style={{
                boxShadow: isSelected
                  ? `0 0 40px rgb(${product.accentRgb} / 0.6), inset 0 0 20px rgb(${product.accentRgb} / 0.2)`
                  : `0 0 30px -8px rgb(${product.accentRgb} / 0.5)`,
              }}
              whileHover={reduceMotion ? undefined : { scale: 1.1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              aria-label={`View ${product.name} details`}
              aria-pressed={isSelected}
            >
              <span
                className="h-3 w-3 rounded-full md:h-3.5 md:w-3.5"
                style={{
                  backgroundColor: product.accent,
                  boxShadow: `0 0 16px rgb(${product.accentRgb} / 0.8)`,
                }}
              />
            </motion.button>

            {/* Tooltip label */}
            <motion.div
              className="pointer-events-none absolute top-full mt-2 whitespace-nowrap text-center text-xs font-medium text-pearl-muted"
              initial={{ opacity: 0, y: 0 }}
              animate={
                isSelected
                  ? { opacity: 0, y: -8 }
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.2 }}
            >
              {product.name}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Detail card overlay */}
      <AnimatePresence mode="wait">
        {selectedProduct && (
          <motion.div
            key="detail-overlay"
            className="fixed inset-0 z-40 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.currentTarget === e.target) {
                setSelectedProductId(null);
              }
            }}
            aria-modal="true"
            role="dialog"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-void/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden
            />

            {/* Detail card */}
            <motion.article
              layoutId={`product-node-${selectedProduct.id}`}
              className="relative z-50 w-full max-w-2xl overflow-hidden rounded-3xl glass-panel p-8 specular-top md:p-12"
              initial={
                reduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }
              }
              animate={{ scale: 1, opacity: 1 }}
              exit={
                reduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }
              }
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                duration: 0.4,
              }}
              style={{
                borderColor: `rgb(${selectedProduct.accentRgb} / 0.3)`,
              }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <motion.div
                  className="absolute -right-32 -top-32 h-64 w-64 rounded-full blur-3xl opacity-20"
                  style={{
                    backgroundColor: selectedProduct.accent,
                  }}
                  animate={
                    reduceMotion
                      ? undefined
                      : { scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }
                  }
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              <div className="relative z-10">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4 md:mb-8">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl glass-pill"
                    style={{
                      boxShadow: `0 0 20px rgb(${selectedProduct.accentRgb} / 0.6)`,
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: selectedProduct.accent,
                      }}
                    />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-pearl md:text-3xl">
                      {selectedProduct.name}
                    </h2>
                    <p
                      className="mt-1 text-sm font-medium text-pearl-muted"
                      style={{ color: `rgb(${selectedProduct.accentRgb})` }}
                    >
                      {selectedProduct.tagline}
                    </p>
                  </div>
                </div>

                {/* Content sections */}
                <div className="space-y-6 md:space-y-8">
                  {/* Personality */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-honey">
                      The Product
                    </h3>
                    <p className="text-base leading-relaxed text-pearl-muted md:text-lg">
                      {selectedProduct.personality}
                    </p>
                  </div>

                  {/* Connection */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-honey">
                      In the Ecosystem
                    </h3>
                    <p className="text-base leading-relaxed text-pearl-muted md:text-lg">
                      {selectedProduct.connection}
                    </p>
                  </div>
                </div>

                {/* Close hint */}
                <motion.div
                  className="mt-8 text-center text-xs text-pearl-dim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Click outside or press <kbd className="mx-1 rounded bg-void-elevated px-2 py-1 font-mono text-pearl-muted">Esc</kbd> to close
                </motion.div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
