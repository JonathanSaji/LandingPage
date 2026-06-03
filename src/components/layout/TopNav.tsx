"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthModal } from "@/components/auth/AuthModal";

function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("subsync_token");
}

export function TopNav() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Read auth state once on mount (client-only)
  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  // Redirect logged-in users straight to dashboard
  useEffect(() => {
    if (loggedIn) router.replace("/dashboard");
  }, [loggedIn, router]);

  function handleDashboardClick() {
    if (isLoggedIn()) {
      router.push("/dashboard");
    } else {
      setShowAuth(true);
    }
  }

  function handleAuthSuccess() {
    setShowAuth(false);
    router.push("/dashboard");
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4"
        aria-label="Site navigation"
      >
        <nav
          className="flex items-center gap-1 rounded-full px-2 py-2"
          style={{
            background: "rgba(14, 14, 14, 0.85)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
          }}
        >
          <NavLink href="/" label="Landing Page" />
          <NavLink href="#about" label="About Us" />
          <DashboardButton onClick={handleDashboardClick} />
        </nav>
      </header>

      {/* Auth modal — triggered when unauthenticated user clicks Dashboard */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuthSuccess={handleAuthSuccess}
            variant="overlay"
          />
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="relative rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors duration-150
                 text-white/50 hover:text-white/90
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {label}
    </a>
  );
}

function DashboardButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="relative rounded-full px-5 py-1.5 text-[13px] font-semibold
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      style={{
        fontFamily: "var(--font-dm-sans)",
        background: "#FFD700",
        color: "#000",
      }}
    >
      Dashboard
    </motion.button>
  );
}
