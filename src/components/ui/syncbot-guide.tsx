"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lock } from "lucide-react";

interface SyncBotGuideProps {
  onClose: () => void;
}

function CmdRow({ trigger, description, ai }: { trigger: string; description: string; ai?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "7px 0", borderBottom: "1px dashed rgba(255,255,255,0.05)",
    }}>
      <span style={{
        fontFamily: "ui-monospace,'Courier New',monospace",
        fontSize: 11, color: "#FFD700", whiteSpace: "nowrap",
        flexShrink: 0, minWidth: 190,
      }}>
        &ldquo;{trigger}&rdquo;
      </span>
      <div style={{ flex: 1, height: 1, borderTop: "1px dotted rgba(255,255,255,0.08)", alignSelf: "center" }} />
      {ai && (
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
          color: "rgba(255,215,0,0.6)", background: "rgba(255,215,0,0.08)",
          borderRadius: 4, padding: "1px 5px", flexShrink: 0,
        }}>AI</span>
      )}
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "right", flexShrink: 0, maxWidth: 180 }}>
        {description}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
        color: "#FFD700", marginBottom: 8, opacity: 0.75,
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export function SyncBotGuide({ onClose }: SyncBotGuideProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="sb-guide-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
          background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px)",
        }}
      >
        <motion.div
          key="sb-guide-panel"
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 620, maxHeight: "88vh",
            borderRadius: 24, background: "rgba(8,8,10,0.98)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.75), 0 0 60px rgba(255,215,0,0.04)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}
        >
          {/* Gold accent bar */}
          <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#FFD700,transparent)", flexShrink: 0 }} />

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 26px 12px", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,215,0,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={16} color="#FFD700" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,215,0,0.65)", marginBottom: 2 }}>
                  SyncBot · AI Voice Assistant
                </p>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                  Voice Commands
                </h2>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.45)", cursor: "pointer", flexShrink: 0,
            }}>
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", padding: "4px 26px 26px", flex: 1, scrollbarWidth: "thin", scrollbarColor: "rgba(255,215,0,0.2) transparent" }}>

            <Section title="Wake &amp; Sleep">
              <CmdRow trigger="wake up" description="Activates SyncBot" />
              <CmdRow trigger="go to sleep" description="Deactivates SyncBot" />
            </Section>

            <Section title="Just Speak Naturally">
              <CmdRow trigger="take me to my dashboard" description="Navigates to dashboard" ai />
              <CmdRow trigger="what are my subscriptions?" description="Reads your subscription data" ai />
              <CmdRow trigger="open TrackerSync" description="Opens the app" ai />
              <CmdRow trigger="what's my most expensive sub?" description="Finds the highest cost" ai />
              <CmdRow trigger="how many trips do I have?" description="Counts your TravelSync trips" ai />
              <CmdRow trigger="scroll down" description="Scrolls the page" ai />
              <CmdRow trigger="how's my fluency practice?" description="Summarizes your sessions" ai />
              <CmdRow trigger="log me out" description="Signs you out" ai />
              <CmdRow trigger="what time is it?" description="Tells you the current time" ai />
              <CmdRow trigger="go back to the homepage" description="Returns to landing page" ai />
            </Section>

            <div style={{
              marginTop: 4, padding: "12px 16px", borderRadius: 12,
              background: "rgba(255,215,0,0.03)", border: "1px solid rgba(255,215,0,0.08)",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <Lock size={11} color="rgba(255,215,0,0.5)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                  In sleep mode SyncBot only listens for &ldquo;wake up&rdquo; — no audio is ever sent to a server.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <Sparkles size={11} color="rgba(255,215,0,0.5)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                  SyncBot understands natural language — these are examples, not commands. Ask anything about your data or the app.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
