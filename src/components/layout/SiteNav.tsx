"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { AppLogoLockup } from "@/components/brand/AppLogo";
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
  const scrolled = useTransform(scrollY, [0, 60], [0, 1]);
  const navOpacity = useTransform(scrolled, [0, 1], [0.92, 1]);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-[var(--spacing-container)]"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className={cn(
          "relative mx-auto mt-4 flex max-w-[1400px] items-center justify-between overflow-hidden rounded-2xl px-5 py-3 specular-top",
          "glass-nav",
        )}
        style={{ opacity: navOpacity }}
      >
        <a
          href="#"
          className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        >
          <AppLogoLockup logoSize="sm" className="transition-opacity group-hover:opacity-90" />
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
          className="flex h-10 w-10 items-center justify-center rounded-xl glass-pill md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-1.5">
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
          </div>
        </button>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="relative mx-auto mt-2 max-w-[1400px] overflow-hidden rounded-2xl glass-panel specular-top md:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block rounded-xl px-4 py-3 text-pearl-muted transition-colors hover:bg-white/[0.06] hover:text-pearl"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 flex flex-col gap-2 border-t border-white/[0.08] pt-4">
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
