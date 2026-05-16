import { CTASection } from "@/components/cta/CTASection";
import { EcosystemSection } from "@/components/ecosystem/EcosystemSection";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { StatsBar } from "@/components/hero/StatsBar";
import { HeroSection } from "@/components/hero/HeroSection";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductsSection } from "@/components/products/ProductsSection";
import { WhySection } from "@/components/why/WhySection";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <StatsBar />
      <EcosystemSection />
      <ProductsSection />
      <FeaturesSection />
      <WhySection />
      <CTASection />
    </MainLayout>
  );
}
