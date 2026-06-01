import { HeroSection } from "@/components/hero/HeroSection";
import { ProductsSection } from "@/components/products/ProductsSection";
import { EcosystemSection } from "@/components/ecosystem/EcosystemSection";
import { CTASection } from "@/components/cta/CTASection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionNav } from "@/components/layout/SectionNav";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <SectionNav />
      <ProductsSection />
      <EcosystemSection />
      <CTASection />
      <SiteFooter />
    </main>
  );
}
