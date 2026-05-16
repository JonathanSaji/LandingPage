"use client";

import Link from "next/link";
import { products } from "@/lib/design-system";
import {
  CountUp,
  DrawPath,
  FloatingParticles,
  GlitchText,
  InfiniteMarquee,
  MagneticHover,
  MorphingBlob,
  OrbitCarousel,
  ParallaxLayer,
  PulseRings,
  ScrollProgress,
  SplitTextReveal,
  StaggerGroup,
  StaggerItem,
  TextScramble,
  TiltCard,
} from "@/components/animations";
import { AppLogoLockup } from "@/components/brand/AppLogo";
import { Button } from "@/components/ui/Button";
import { AmbientBackground } from "@/components/layout/AmbientBackground";

function DemoCard({
  title,
  description,
  code,
  children,
}: {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl glass-card p-6 specular-top md:p-8">
      <h3 className="text-lg font-semibold text-pearl">{title}</h3>
      <p className="mt-1 text-sm text-pearl-muted">{description}</p>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-black/50 p-4 font-mono text-[11px] text-honey/90">
        {code}
      </pre>
      <div className="mt-6 flex min-h-[140px] items-center justify-center rounded-xl border border-white/[0.06] bg-void/60 p-6">
        {children}
      </div>
    </article>
  );
}

export default function AnimationsPage() {
  const orbitItems = products.map((p) => ({
    id: p.id,
    label: p.name.replace("Sync", ""),
    color: p.accent,
  }));

  return (
    <>
      <ScrollProgress className="fixed left-0 right-0 top-0 z-[100] h-0.5" />
      <AmbientBackground />
      <FloatingParticles count={25} className="fixed inset-0 z-0" />

      <div className="relative z-10 min-h-dvh">
        <header className="border-b border-white/[0.08] px-[var(--spacing-container)] py-6">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="text-sm text-pearl-muted transition-colors hover:text-honey"
              >
                ← Back to landing
              </Link>
              <AppLogoLockup logoSize="md" className="mt-3" />
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-pearl md:text-4xl">
                Animation <span className="text-gradient-honey">Playground</span>
              </h1>
              <p className="mt-2 max-w-xl text-pearl-muted">
                Copy any component from{" "}
                <code className="text-honey">@/components/animations</code>
              </p>
            </div>
            <MagneticHover strength={0.25}>
              <Button>Try magnetic</Button>
            </MagneticHover>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] space-y-8 px-[var(--spacing-container)] py-12">
          <section className="relative overflow-hidden rounded-3xl glass-panel p-10 specular-top md:p-14">
            <MorphingBlob className="absolute -right-10 -top-10 h-48 w-48 opacity-60" />
            <PulseRings className="absolute left-8 top-8 opacity-80" size={80} />
            <SplitTextReveal
              text="Crazy animations. Ready to drop in."
              as="h2"
              className="relative z-10 max-w-2xl text-4xl font-bold text-pearl md:text-5xl"
            />
            <p className="relative z-10 mt-4 text-pearl-muted">
              <GlitchText className="text-honey">All motion-aware</GlitchText> — respects{" "}
              <code className="text-pearl-dim">prefers-reduced-motion</code>
            </p>
          </section>

          <InfiniteMarquee speed={22} className="py-4">
            {["TravelSync", "PhotoSync", "BrainSync", "FluencySync", "SteadySync", "Subtracker", "SeatSync"].map(
              (name) => (
                <span
                  key={name}
                  className="glass-pill px-6 py-2 text-sm font-medium text-pearl-muted"
                >
                  {name}
                </span>
              ),
            )}
          </InfiniteMarquee>

          <div className="grid gap-6 lg:grid-cols-2">
            <DemoCard
              title="SplitTextReveal"
              description="Words or chars flip up in 3D."
              code={`<SplitTextReveal text="Hello world" mode="words" />`}
            >
              <SplitTextReveal
                text="Seven apps. One sync."
                className="text-3xl font-bold text-pearl"
              />
            </DemoCard>

            <DemoCard
              title="TextScramble"
              description="Matrix-style decode on scroll."
              code={`<TextScramble text="SUBSYNC" duration={1.2} />`}
            >
              <TextScramble text="SUBSYNC_CORE" className="text-2xl text-honey" />
            </DemoCard>

            <DemoCard
              title="GlitchText"
              description="Periodic RGB split glitch."
              code={`<GlitchText interval={3}>Sync</GlitchText>`}
            >
              <GlitchText className="text-4xl font-bold text-pearl">
                BUMBLEBEE
              </GlitchText>
            </DemoCard>

            <DemoCard
              title="CountUp"
              description="Spring-animated numbers."
              code={`<CountUp value={10000} suffix="+" />`}
            >
              <CountUp
                value={10000}
                suffix="+"
                className="text-5xl font-bold text-honey"
              />
            </DemoCard>

            <DemoCard
              title="TiltCard"
              description="3D tilt + glare on hover."
              code={`<TiltCard maxTilt={14}>...</TiltCard>`}
            >
              <TiltCard className="w-48 p-6 text-center text-sm text-pearl">
                Hover me
              </TiltCard>
            </DemoCard>

            <DemoCard
              title="MagneticHover"
              description="Element follows cursor."
              code={`<MagneticHover strength={0.35}>...</MagneticHover>`}
            >
              <MagneticHover strength={0.4}>
                <span className="rounded-full glass-pill px-8 py-4 text-pearl">
                  Magnetic
                </span>
              </MagneticHover>
            </DemoCard>

            <DemoCard
              title="PulseRings"
              description="Expanding sonar rings."
              code={`<PulseRings count={4} size={120} />`}
            >
              <PulseRings size={100} />
            </DemoCard>

            <DemoCard
              title="OrbitCarousel"
              description="Items orbit a center core."
              code={`<OrbitCarousel items={items} radius={90} />`}
            >
              <OrbitCarousel items={orbitItems.slice(0, 5)} radius={70} duration={18} />
            </DemoCard>

            <DemoCard
              title="DrawPath"
              description="SVG stroke draw on scroll."
              code={`<DrawPath d="M10,60 Q80,10 150,60" />`}
            >
              <DrawPath
                className="h-24 w-full"
                d="M 10 60 Q 80 10 150 60 T 290 60"
                strokeWidth={2}
              />
            </DemoCard>

            <DemoCard
              title="StaggerGroup"
              description="Children cascade in."
              code={`<StaggerGroup stagger={0.1}>...</StaggerGroup>`}
            >
              <StaggerGroup className="flex flex-col gap-2" stagger={0.12}>
                {["Capture", "Pulse", "Compound", "Act"].map((s) => (
                  <StaggerItem key={s}>
                    <span className="glass-pill block px-4 py-2 text-sm text-pearl">
                      {s}
                    </span>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </DemoCard>
          </div>

          <section className="relative h-64 overflow-hidden rounded-2xl glass-panel">
            <ParallaxLayer speed={0.6} className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-honey/20">PARALLAX</span>
            </ParallaxLayer>
            <p className="absolute bottom-4 left-4 text-xs text-pearl-dim">
              Scroll this page — ParallaxLayer moves with scroll
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
