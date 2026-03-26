import Link from "next/link";
import { Logo } from "./components/logo";
import { MobileNav } from "./components/mobile-nav";
import { NewsletterSignup } from "./components/newsletter-signup";
import { prisma } from "@repo/db";
import { Gift, Shield, Zap, ShoppingCart, Mail, Phone } from "lucide-react";

export default async function HomePage() {
  // Bestseller-Auswahl für die Startseite (je 1-2 pro Marke, verschiedene Preisstufen)
  const featuredSkus = [
    "MCAFEE-IS-1PC-1Y", "MCAFEE-TP-1PC-1Y",
    "NORTON-360-DLX-VPN-3D-1Y", "NORTON-360-PREM-10D-1Y",
    "AVG-TUNEUP-3D-1Y", "AVG-IS-1PC-1Y",
    "AVAST-PREM-1PC-1Y",
    "PANDA-ESS-1PC-1Y", "PANDA-COMP-1PC-1Y",
    "BITDEF-AV-1PC-1Y", "BITDEF-TS-5D-1Y",
    "ESET-NOD32-3D-1Y",
    "GDATA-AV-1PC-1Y",
    "TREND-IS-1PC-1Y",
    "MS-OFFICE-HS-2021", "WIN11-PRO-OEM",
    "PARALLELS-18-STD-1Y",
    "ACRONIS-ESS-1PC-1Y",
  ];
  const products = await prisma.product.findMany({
    where: { sku: { in: featuredSkus }, stockLevel: { gt: 0 } },
    select: { id: true, sku: true, name: true, sellPrice: true, uvpPrice: true, brand: true, description: true, stockLevel: true, category: true },
    orderBy: { sellPrice: "asc" },
  });

  // Anzahl aller aktiven Produkte für den "Alle X Produkte" Link
  const totalProducts = await prisma.product.count({ where: { stockLevel: { gt: 0 } } });

  return (
    <div className="min-h-screen flex flex-col">
      {/* USP Banner */}
      <div className="bg-[var(--gold)]/10 border-b border-[var(--gold)]/20 text-center py-2.5 px-4">
        <Gift className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-[var(--gold)]" />
        <span className="text-sm font-medium">Wir erstatten jeden 10. Kauf</span>
        <span className="text-sm text-[var(--foreground)]/60"> — freiwillige Kulanzleistung</span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-8">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/products" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Produkte</Link>
              <Link href="/blog" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Ratgeber</Link>
              <Link href="/transparenz" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Transparenz</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Jetzt einkaufen
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-blue)]/8 via-[var(--secondary)]/40 to-[var(--gold)]/8" />
          <div className="absolute inset-0 hero-pattern opacity-40" />
          <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)]/15 px-4 py-1.5 text-sm font-medium text-[var(--gold)] mb-6 border border-[var(--gold)]/20">
                <Gift className="h-4 w-4" />
                Jeder 10. Kauf wird erstattet
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Software
                <span className="block mt-2 pb-3 bg-gradient-to-r from-[var(--foreground)] via-[var(--brand-blue)] to-[var(--foreground)] bg-clip-text text-transparent leading-[1.3] [box-decoration-break:clone]">günstig &amp; sicher</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Antivirus, Office und Windows — autorisierte Lizenzen zu fairen Preisen.
                Sofortige Lieferung per E-Mail. Als Kulanz erstatten wir jeden zehnten Kauf.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-[var(--foreground)] text-[var(--primary-foreground)] font-medium hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Alle {totalProducts} Produkte
                </Link>
                <Link
                  href="#so-funktionierts"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-[var(--border)] font-medium hover:bg-[var(--secondary)] hover:border-[var(--muted-foreground)]/30 transition-all"
                >
                  So funktioniert es
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--background)]/80 backdrop-blur border border-[var(--border)]/50 hover:border-[var(--brand-teal)]/30 hover:shadow-md transition-all">
                <div className="rounded-2xl bg-gradient-to-br from-[var(--brand-teal)]/20 to-[var(--brand-teal)]/5 p-3.5 mb-3">
                  <Zap className="h-6 w-6 text-[var(--brand-teal)]" />
                </div>
                <h2 className="font-semibold">Sofortige Lieferung</h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">Lizenzschlüssel direkt per E-Mail</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--background)]/80 backdrop-blur border border-[var(--border)]/50 hover:border-[var(--brand-blue)]/30 hover:shadow-md transition-all">
                <div className="rounded-2xl bg-gradient-to-br from-[var(--brand-blue)]/20 to-[var(--brand-blue)]/5 p-3.5 mb-3">
                  <Shield className="h-6 w-6 text-[var(--brand-blue)]" />
                </div>
                <h2 className="font-semibold">Sichere Zahlung</h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">SSL-verschlüsselt über Stripe</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--background)]/80 backdrop-blur border border-[var(--border)]/50 hover:border-[var(--gold)]/30 hover:shadow-md transition-all">
                <div className="rounded-2xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/5 p-3.5 mb-3">
                  <Gift className="h-6 w-6 text-[var(--gold)]" />
                </div>
                <h2 className="font-semibold">Jeder 10. Kauf erstattet</h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">Freiwillige Kulanzleistung</p>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="produkte" className="py-16 px-6 bg-[var(--secondary)]/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Beliebte Produkte</h2>
                <p className="mt-2 text-[var(--muted-foreground)]">Unsere Empfehlungen — aus {totalProducts} Produkten</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hidden sm:block">
                Alle anzeigen →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => {
                const bl = p.brand?.toLowerCase() ?? '';
                const brandClass = bl.includes('norton') ? 'brand-norton'
                  : bl.includes('mcafee') ? 'brand-mcafee'
                  : bl.includes('bitdefender') ? 'brand-bitdefender'
                  : bl.includes('trend') ? 'brand-trendmicro'
                  : bl.includes('panda') ? 'brand-panda'
                  : bl.includes('f-secure') ? 'brand-fsecure'
                  : bl.includes('microsoft') ? 'brand-microsoft'
                  : bl.includes('parallels') ? 'brand-parallels'
                  : bl.includes('avg') ? 'brand-avg'
                  : bl.includes('avast') ? 'brand-avast'
                  : bl.includes('eset') ? 'brand-eset'
                  : bl.includes('kaspersky') ? 'brand-kaspersky'
                  : bl.includes('g data') ? 'brand-gdata'
                  : bl.includes('acronis') ? 'brand-acronis'
                  : bl.includes('abbyy') ? 'brand-abbyy'
                  : 'brand-default';
                const hasUvp = p.uvpPrice && Number(p.uvpPrice) > Number(p.sellPrice);
                const savingsPercent = hasUvp ? Math.round((1 - Number(p.sellPrice) / Number(p.uvpPrice)) * 100) : 0;
                return (
                  <div key={p.id} className="group rounded-xl border bg-[var(--card)] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    {/* Brand color header area */}
                    <div className={`${brandClass} px-5 pt-5 pb-4`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-flex items-center rounded-full bg-[var(--background)]/80 backdrop-blur px-2.5 py-0.5 text-xs font-medium">
                          {p.category || p.brand}
                        </span>
                        {hasUvp && (
                          <span className="inline-flex items-center rounded-full bg-[var(--destructive)] px-2 py-0.5 text-xs font-bold text-white">
                            -{savingsPercent}%
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]/70 mb-1">{p.brand}</p>
                      <h3 className="font-semibold text-lg leading-tight">{p.name}</h3>
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{p.description}</p>
                    </div>
                    <div className="px-5 pb-5 pt-3 border-t flex flex-col gap-3">
                      <div>
                        {hasUvp && (
                          <span className="text-xs text-[var(--muted-foreground)] line-through mr-2">
                            UVP {Number(p.uvpPrice).toFixed(2).replace(".", ",")} €
                          </span>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{Number(p.sellPrice).toFixed(2).replace(".", ",")} €</span>
                          <span className="text-xs text-[var(--muted-foreground)]">Endpreis</span>
                        </div>
                      </div>
                      <Link
                        href={`/products/${p.sku}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:scale-[1.02] active:scale-[0.98] transition-all w-full"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Jetzt kaufen
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-sm font-medium hover:bg-[var(--secondary)] transition-all"
              >
                Alle {totalProducts} Produkte anzeigen →
              </Link>
            </div>

            {/* Kategorien-Schnellnavigation */}
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6 text-center">Nach Kategorie stöbern</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { cat: "Antivirus", icon: "🛡️", desc: "Virenschutz" },
                  { cat: "Internet Security", icon: "🔒", desc: "Firewall & mehr" },
                  { cat: "Total Security", icon: "🏆", desc: "Komplett-Schutz" },
                  { cat: "Office", icon: "💼", desc: "Word, Excel & Co." },
                  { cat: "Windows", icon: "🖥️", desc: "Betriebssystem" },
                  { cat: "VPN", icon: "🌐", desc: "Privatsphäre" },
                  { cat: "Utilities", icon: "⚙️", desc: "Tools & Optimierung" },
                  { cat: "Backup", icon: "💾", desc: "Datensicherung" },
                  { cat: "Mac", icon: "🍎", desc: "Mac-Software" },
                ].map((c) => (
                  <Link
                    key={c.cat}
                    href={`/products?category=${encodeURIComponent(c.cat)}`}
                    className="flex flex-col items-center gap-2 rounded-xl border bg-[var(--card)] p-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-sm font-semibold">{c.cat}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{c.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="so-funktionierts" className="bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold tracking-tight mb-4">So funktioniert 1of10</h2>
              <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Drei einfache Schritte zu Ihrer Software — und der Möglichkeit einer vollständigen Erstattung.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="relative rounded-2xl border bg-[var(--card)] p-6 hover:shadow-md transition-all">
                <div className="step-number text-4xl font-black mb-4">01</div>
                <div className="h-1 w-12 rounded-full bg-[var(--brand-teal)] mb-4" />
                <h3 className="text-lg font-semibold mb-2">Produkt wählen</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Wählen Sie aus über {totalProducts} Produkten: Antivirus, Office, Windows und mehr.
                </p>
              </div>
              <div className="relative rounded-2xl border bg-[var(--card)] p-6 hover:shadow-md transition-all">
                <div className="step-number text-4xl font-black mb-4">02</div>
                <div className="h-1 w-12 rounded-full bg-[var(--brand-blue)] mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sicher bezahlen</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Bezahlen Sie sicher über Stripe. Ihr Lizenzschlüssel kommt sofort per E-Mail.
                </p>
              </div>
              <div className="relative rounded-2xl border bg-[var(--card)] p-6 hover:shadow-md transition-all">
                <div className="step-number text-4xl font-black mb-4">03</div>
                <div className="h-1 w-12 rounded-full bg-[var(--gold)] mb-4" />
                <h3 className="text-lg font-semibold mb-2">Erstattung prüfen</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Nach dem Kauf erfahren Sie sofort, ob Ihr Kauf als Kulanz erstattet wird. Ihre Software behalten Sie in jedem Fall.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-blue)]/8 to-[var(--gold)]/8" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="max-w-xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-blue)]/10 px-4 py-1.5 text-sm font-medium text-[var(--brand-blue)] mb-4">
                <Mail className="h-4 w-4" />
                Newsletter
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Auf dem Laufenden bleiben</h2>
              <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
                Erhalten Sie Informationen zu neuen Produkten, Angeboten und Erstattungs-Updates.
              </p>
              <div className="mt-6 max-w-sm mx-auto">
                <NewsletterSignup variant="banner" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[var(--foreground)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <span className="text-xl font-extrabold text-[var(--primary-foreground)]">
                  <span className="opacity-60">1</span>of<span>10</span>
                </span>
              </Link>
              <p className="text-sm text-[var(--primary-foreground)]/60 leading-relaxed">
                Ihr zuverlässiger Partner für günstige Software. Autorisierte Lizenzschlüssel zu fairen Preisen.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-[var(--primary-foreground)]/70">Shop</h3>
              <ul className="space-y-3">
                <li><Link href="/products" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Alle Produkte</Link></li>
                <li><Link href="/blog" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Ratgeber</Link></li>
                <li><Link href="/transparenz" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Transparenz</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-[var(--primary-foreground)]/70">Rechtliches</h3>
              <ul className="space-y-3">
                <li><Link href="/impressum" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Impressum</Link></li>
                <li><Link href="/datenschutz" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Datenschutz</Link></li>
                <li><Link href="/agb" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">AGB</Link></li>
                <li><Link href="/widerruf" className="text-sm text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors">Widerruf</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4 text-[var(--primary-foreground)]/70">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-[var(--primary-foreground)]/60">
                  <Mail className="h-4 w-4 mr-2 shrink-0" />
                  info@medialess.de
                </li>
                <li className="flex items-center text-sm text-[var(--primary-foreground)]/60">
                  <Phone className="h-4 w-4 mr-2 shrink-0" />
                  0152 25389619
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-[var(--primary-foreground)]/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--primary-foreground)]/60">
              © {new Date().getFullYear()} 1of10 · Michael Hahnel · München
            </p>
            <div className="flex items-center gap-4">
              <a href="https://de.trustpilot.com/review/1of10.de" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary-foreground)]/60 hover:text-[var(--primary-foreground)] transition-colors flex items-center gap-1">
                ★ Trustpilot
              </a>
              <p className="text-xs text-[var(--primary-foreground)]/60">
                Alle Preise Endpreise · gem. §19 UStG keine USt.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
