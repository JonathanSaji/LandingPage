"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Products", href: "#products" },
  { label: "Features", href: "#features" },
  { label: "Why SubSync", href: "#why" },
];

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], [0, 1]);
  const backgroundColor = useTransform(
    navBg,
    (v) => `rgba(10, 10, 18, ${v * 0.85})`,
  );
  const borderColor = useTransform(
    navBg,
    (v) => `rgba(244, 242, 255, ${v * 0.08})`,
  );
  const backdropFilter = useTransform(navBg, (v) =>
    v > 0.1 ? "blur(20px)" : "blur(0px)",
  );

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-[var(--spacing-container)]"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="mx-auto mt-4 flex max-w-[1400px] items-center justify-between rounded-2xl border px-5 py-3"
        style={{
          backgroundColor,
          borderColor,
          backdropFilter,
        }}
      >
        <a
          href="#"
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-lg"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <span className="absolute inset-0 rounded-xl bg-iris/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
            <svg
              viewBox="0 0 24 24"
              className="relative h-4 w-4 text-sync-core"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </span>
          <span className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-pearl">
            Sub<span className="text-iris-glow">Sync</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-pearl-muted transition-colors hover:text-pearl"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <motion.div
          className="hidden items-center gap-3 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="ghost" className="!px-4 !py-2 text-sm">
            Sign in
          </Button>
          <Button className="!px-5 !py-2.5 text-sm">Get early access</Button>
        </motion.div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <motion.div className="flex flex-col gap-1.5">
            <span
              className={cn(
                "h-0.5 w-5 bg-pearl transition-transform",
                mobileOpen && "translate-y-2 rotate-45",
              )}
            />
            <span
              className={cn(
                "h-0.5 w-5 bg-pearl transition-opacity",
                mobileOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "h-0.5 w-5 bg-pearl transition-transform",
                mobileOpen && "-translate-y-2 -rotate-45",
              )}
            />
          </motion.div>
        </button>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mx-auto mt-2 max-w-[1400px] overflow-hidden rounded-2xl glass-panel md:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block rounded-xl px-4 py-3 text-pearl-muted hover:bg-white/[0.04] hover:text-pearl"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                <Button variant="secondary" className="w-full">
                  Sign in
                </Button>
                <Button className="w-full">Get early access</Button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
