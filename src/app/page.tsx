import { HeroSection } from "@/components/hero/HeroSection";
import { ProductsSection } from "@/components/products/ProductsSection";
import { EcosystemSection } from "@/components/ecosystem/EcosystemSection";
import { CTASection } from "@/components/cta/CTASection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProductsSection />
      <EcosystemSection />
      <CTASection />
    </main>
  );
}
