"use client";

import { motion, useReducedMotion } from "framer-motion";

const APPS = [
  { name: "TrackerSync", url: "https://trackersync.sub-sync.ca" },
  { name: "TravelSync",  url: "https://travelsync.sub-sync.ca" },
  { name: "BrainSync",   url: "https://brainsync.sub-sync.ca" },
  { name: "SeatSync",    url: "https://seatsync.sub-sync.ca" },
  { name: "PhotoSync",   url: "https://photosync.sub-sync.ca" },
  { name: "FluencySync", url: "https://fluencysync.sub-sync.ca" },
  { name: "SteadySync",  url: "https://steadysync.sub-sync.ca" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export function SiteFooter() {
  const reduceMotion = useReducedMotion();

  return (
    <footer
      id="footer"
      className="relative bg-black py-16 px-10"
    >
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" aria-hidden />
      <motion.div
        className="mx-auto max-w-[1400px]"
        {...(reduceMotion ? {} : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.6, ease: EASE },
        })}
      >
        {/* Top row: wordmark left, app links right */}
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:items-start md:gap-16">
          {/* Wordmark + tagline */}
          <div className="flex-shrink-0">
            <span className="font-heading font-extrabold text-[22px] tracking-tight text-[#FFD700]">
              SubSync
            </span>
            <p className="font-body text-[13px] mt-2" style={{ color: "#444" }}>
              One ecosystem. Seven apps.
            </p>
          </div>

          {/* App links grid */}
          <nav aria-label="SubSync apps">
            <div className="grid grid-cols-2 gap-x-10 gap-y-3 md:grid-cols-4">
              {APPS.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-[13px] text-[#555] hover:text-white transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  {app.name}
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/[0.05]" aria-hidden />

        {/* Bottom row: copyright */}
        <div className="flex items-center">
          <p className="font-body text-[12px]" style={{ color: "#333" }}>
            © 2025 SubSync. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
