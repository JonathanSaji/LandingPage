"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SyncBotGuideProps {
  onClose: () => void;
}

function CmdRow({ trigger, description }: { trigger: string; description: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        padding: "7px 0",
        borderBottom: "1px dashed rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          fontFamily: "ui-monospace, 'Courier New', monospace",
          fontSize: 12,
          color: "#FFD700",
          whiteSpace: "nowrap",
          flexShrink: 0,
          minWidth: 210,
        }}
      >
        &ldquo;{trigger}&rdquo;
      </span>
      <div style={{ flex: 1, height: 1, borderTop: "1px dotted rgba(255,255,255,0.1)", alignSelf: "center" }} />
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "right", flexShrink: 0, maxWidth: 200 }}>
        {description}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#FFD700",
          marginBottom: 10,
          opacity: 0.8,
        }}
      >
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <motion.div
          key="sb-guide-panel"
          initial={{ opacity: 0, scale: 0.92, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 640,
            maxHeight: "85vh",
            borderRadius: 28,
            background: "rgba(8,8,8,0.97)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.75), 0 0 60px rgba(255,215,0,0.04)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Gold accent */}
          <div
            style={{
              height: 3,
              background: "linear-gradient(90deg, transparent, #FFD700, transparent)",
              flexShrink: 0,
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "22px 28px 14px",
              flexShrink: 0,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#FFD700",
                  marginBottom: 4,
                  opacity: 0.75,
                }}
              >
                Sync Core Voice Interface
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                SyncBot Commands
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.45)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div
            style={{
              overflowY: "auto",
              padding: "4px 28px 28px",
              flex: 1,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,215,0,0.2) transparent",
            }}
          >
            <Section title="Activation">
              <CmdRow trigger="[click the icon]" description="Start listening (always-on mode)" />
              <CmdRow trigger="go to sleep" description="Stop listening, go idle" />
              <CmdRow trigger="sleep" description="Stop listening" />
              <CmdRow trigger="mute" description="Mute and ignore all commands except unmute" />
              <CmdRow trigger="unmute" description="Unmute and resume processing commands" />
              <CmdRow trigger="repeat that" description="Re-speak last response" />
              <CmdRow trigger="help / show commands" description="Open this guide" />
            </Section>

            <Section title="Navigation">
              <CmdRow trigger="go home" description="Go to the landing page" />
              <CmdRow trigger="dashboard" description="Go to your dashboard" />
              <CmdRow trigger="open [AppName]" description="Open app in new tab" />
            </Section>

            <Section title="Apps">
              <CmdRow trigger="TrackerSync / tracker" description="Finance tracker" />
              <CmdRow trigger="TravelSync / travel" description="Trip planner" />
              <CmdRow trigger="BrainSync / brain" description="Focus sessions" />
              <CmdRow trigger="SeatSync / seat" description="Workplace scheduling" />
              <CmdRow trigger="PhotoSync / photo" description="Memory organizer" />
              <CmdRow trigger="FluencySync / fluency" description="Language learning" />
              <CmdRow trigger="SteadySync / steady" description="Unified account hub" />
            </Section>

            <Section title="Account">
              <CmdRow trigger="log out / logout" description="Sign out and go home" />
              <CmdRow trigger="sign out" description="Sign out and go home" />
              <CmdRow trigger="log in / sign in" description="Open the login modal" />
            </Section>

            <Section title="Page Control">
              <CmdRow trigger="scroll down / scroll up" description="Scroll 400px" />
              <CmdRow trigger="scroll to top / bottom" description="Jump to edge of page" />
              <CmdRow trigger="scroll left / scroll right" description="Carousel navigation" />
              <CmdRow trigger="close / dismiss" description="Close any open modal" />
              <CmdRow trigger="click [button name]" description="Tap any visible button" />
            </Section>

            <Section title="Information">
              <CmdRow trigger="where am I" description="Current page name" />
              <CmdRow trigger="list apps" description="Read all 7 app names" />
              <CmdRow trigger="what time is it" description="Current time" />
              <CmdRow trigger="what day is it" description="Today's date" />
            </Section>

            {/* Privacy note */}
            <div
              style={{
                marginTop: 8,
                padding: "13px 18px",
                borderRadius: 14,
                background: "rgba(255,215,0,0.03)",
                border: "1px solid rgba(255,215,0,0.1)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.38)",
                  lineHeight: 1.6,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                🔒 All commands run entirely in your browser using the Web Speech API.
                <br />
                No voice data is ever sent to any server.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
