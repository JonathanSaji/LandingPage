'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface DockItem {
  id: string;
  label: string;
  color: string;
  logoIcon?: LucideIcon;
  logoSrc?: string;
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'tracker',  label: 'TrackerSync',  color: '#FFD700',  logoSrc: '/logos/TrackerSync.avif' },
  { id: 'travel',   label: 'TravelSync',   color: '#F2994A',  logoSrc: '/logos/TravelSync.avif' },
  { id: 'brain',    label: 'BrainSync',    color: '#FFD700',  logoSrc: '/logos/BrainSync.avif' },
  { id: 'seat',     label: 'SeatSync',     color: '#39FF14',  logoSrc: '/logos/SeatSync.avif' },
  { id: 'photo',    label: 'PhotoSync',    color: '#A259FF',  logoSrc: '/logos/PhotoSync.avif' },
  { id: 'fluency',  label: 'FluencySync',  color: '#FF3C38',  logoSrc: '/logos/Fluency.avif' },
  { id: 'steady',   label: 'SteadySync',   color: '#3A7B7B',  logoSrc: '/logos/SteadySync.avif' },
];

export function RightSideDock() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Authentication check synced with pathname changes
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('subsync_token') : null;
      setIsLoggedIn(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [pathname]);

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 400); // 400ms delay before sliding out
  };

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Invisible Trigger Zone (24px wide flush against the right edge) */}
      <div
        className="fixed right-0 top-0 h-screen w-6 z-[9998] bg-transparent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Dock Container */}
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-[9999] flex flex-col items-end transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Main Dock Panel */}
        <div className="bg-neutral-900/40 backdrop-blur-3xl border-l border-t border-b border-white/15 rounded-l-2xl px-3 py-5 flex flex-col gap-3 items-center shadow-[inset_0_1.5px_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.6)] relative mr-0">
          {DOCK_ITEMS.map((item) => {
            const Icon = item.logoIcon;
            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-200 ease-out hover:scale-125 hover:-translate-x-1 hover:shadow-[0_0_15px_rgba(255,215,0,0.25)] hover:border-[#FFD700]/30 cursor-pointer"
                  onClick={() => console.log(`Navigating to ${item.label}`)}
                >
                  {Icon ? (
                    <Icon className="w-7 h-7" style={{ color: item.color }} />
                  ) : (
                    <Image
                      src={item.logoSrc!}
                      alt={item.label}
                      width={28}
                      height={28}
                      priority
                    />
                  )}
                </button>

                {/* Tooltip (aligned to the left of the item) */}
                <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur text-white text-xs rounded-md px-2.5 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap border border-white/10 z-[10000] shadow-md translate-x-2 group-hover:translate-x-0">
                  {item.label}
                </div>
              </div>
            );
          })}

          {/* Flipped reflection below the dock panel (only rendered on desktop md:block) */}
          {/* Positioned absolutely below the main panel so it does not affect vertical centering */}
          <div className="hidden md:block absolute top-[calc(100%+12px)] right-0 w-full pointer-events-none select-none opacity-20 scale-y-[-1] origin-top pr-0">
            <div className="bg-neutral-900/40 backdrop-blur-3xl border-l border-t border-b border-white/15 rounded-l-2xl px-3 py-5 flex flex-col gap-3 items-center [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.6)_0%,transparent_80%)] shadow-[inset_0_1.5px_0_rgba(255,255,255,0.15)]">
              {DOCK_ITEMS.map((item) => {
                const Icon = item.logoIcon;
                return (
                  <div
                    key={`reflect-${item.id}`}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
                  >
                    {Icon ? (
                      <Icon className="w-7 h-7 opacity-75" style={{ color: item.color }} />
                    ) : (
                      <Image
                        src={item.logoSrc!}
                        alt=""
                        width={28}
                        height={28}
                        className="opacity-75 filter brightness-90"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
