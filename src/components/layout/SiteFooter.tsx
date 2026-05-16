import { AppLogoLockup } from "@/components/brand/AppLogo";
import { products } from "@/lib/design-system";

const footerLinks = {
  ecosystem: [
    { label: "How it works", href: "#ecosystem" },
    { label: "Sync Core", href: "#ecosystem" },
    { label: "All products", href: "#products" },
  ],
  company: [
    { label: "About", href: "#why" },
    { label: "Features", href: "#features" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative">
      <div className="section-divider" />

      <div className="relative glass-nav">
        <div className="mx-auto max-w-[1400px] px-[var(--spacing-container)] py-16 md:py-20">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <a href="#" className="inline-flex transition-opacity hover:opacity-90">
                <AppLogoLockup logoSize="sm" />
              </a>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-pearl-muted">
                Seven specialized apps orbiting one intelligent core. Travel,
                memory, mind, language, wellness, money, and live experiences —
                finally in sync.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {products.map((product) => (
                  <li key={product.id}>
                    <a
                      href="#products"
                      className="inline-flex items-center gap-1.5 rounded-full glass-pill px-2.5 py-1 text-[10px] text-pearl-dim transition-colors hover:border-honey/25 hover:text-pearl-muted"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: product.accent }}
                      />
                      {product.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-pearl-dim">
                Ecosystem
              </h3>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.ecosystem.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-pearl-muted transition-colors hover:text-honey"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-pearl-dim">
                Company
              </h3>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-pearl-muted transition-colors hover:text-honey"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-pearl-dim">
                Legal
              </h3>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-pearl-muted transition-colors hover:text-honey"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-8 md:flex-row">
            <p className="font-[family-name:var(--font-mono)] text-[11px] text-pearl-dim">
              © {year} SubSync. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Twitter", "GitHub", "Discord"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.15em] text-pearl-dim transition-colors hover:text-honey"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
