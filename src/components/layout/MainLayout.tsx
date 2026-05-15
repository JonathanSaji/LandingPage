"use client";

import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { SiteNav } from "@/components/layout/SiteNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <AmbientBackground />
      <SiteNav />
      <main className="relative z-0">{children}</main>
    </>
  );
}
