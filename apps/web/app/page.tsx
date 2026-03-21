import Link from "next/link";
import { LogoFull } from "./components/logo";
import { NewsletterSignup } from "./components/newsletter-signup";
import { prisma } from "@repo/db";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { stockLevel: { gt: 0 } },
    select: { id: true, sku: true, name: true, sellPrice: true, brand: true, description: true, stockLevel: true },
    orderBy: { sellPrice: "asc" },
  });

  return (
    <main>
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold">
              <LogoFull size="sm" />
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              <Link href="/products" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Produkte</Link>
              <Link href="/blog" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Ratgeber</Link>
              <Link href="/faq" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">FAQ</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--secondary)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 sm:py-20 lg:py-28">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--foreground)]">
                Security-Software zum fairen Preis
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed">
                Autorisierte Keys von Norton, McAfee und Avast. Sofortige Lieferung per E-Mail.
                Als freiwillige Kulanz erstatten wir jeden zehnten Kauf vollst&#228;ndig.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[var(--foreground)] text-[var(--primary-foreground)] rounded-full text-base font-medium hover:bg-[var(--foreground)]/90 transition-colors"
                >
                  Alle Produkte
                </Link>
                <a
                  href="#so-funktionierts"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 border border-[var(--border)] rounded-full text-base font-medium hover:bg-[var(--secondary)] transition-colors"
                >
                  So funktioniert es
                </a>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full bg-gradient-to-l from-[var(--secondary)]/50 to-transparent pointer-events-none hidden lg:block" />
      </section>

      {/* Products */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-medium tracking-tight">Unsere Produkte</h2>
            <p className="mt-2 text-[var(--muted-foreground)]">Autorisierte Software ab 14,99 &#8364;</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hidden sm:block">
            Alle anzeigen &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <Link key={p.id} href={`/products/${p.sku}`} className="group">
              <div className="aspect-square bg-[var(--secondary)] rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{p.brand}</p>
                  <p className="mt-2 text-sm font-medium text-[var(--foreground)]/60 px-6 leading-snug">{p.name}</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-[var(--foreground)] group-hover:underline">{p.name}</h3>
                <p className="text-sm font-medium text-[var(--foreground)]">{Number(p.sellPrice).toFixed(2).replace(".", ",")} &#8364;</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="so-funktionierts" className="bg-[var(--secondary)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h2 className="text-3xl font-medium tracking-tight mb-4">So funktioniert 1of10</h2>
          <p className="text-[var(--muted-foreground)] mb-12 max-w-2xl">Drei einfache Schritte zu Ihrer Software &#8212; und der M&#246;glichkeit einer vollst&#228;ndigen Erstattung.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div>
              <div className="text-sm font-semibold text-[var(--muted-foreground)] mb-3">01</div>
              <h3 className="text-lg font-medium mb-2">Produkt w&#228;hlen</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">W&#228;hlen Sie aus unserem Sortiment autorisierter Security-Software.</p>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--muted-foreground)] mb-3">02</div>
              <h3 className="text-lg font-medium mb-2">Sicher bezahlen</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">Bezahlen Sie sicher &#252;ber Stripe. Ihr Lizenzschl&#252;ssel kommt sofort per E-Mail.</p>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--muted-foreground)] mb-3">03</div>
              <h3 className="text-lg font-medium mb-2">Erstattung pr&#252;fen</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">Nach dem Kauf erfahren Sie sofort, ob Ihr Kauf als Kulanz erstattet wird. Ihre Software behalten Sie in jedem Fall.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-md">
          <h2 className="text-2xl font-medium tracking-tight">Auf dem Laufenden bleiben</h2>
          <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">Erhalten Sie Informationen zu neuen Produkten und Erstattungs-Updates.</p>
          <div className="mt-6">
            <NewsletterSignup variant="banner" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 sm:py-16 flex flex-col sm:flex-row gap-8 sm:gap-16">
            <div className="sm:max-w-xs">
              <Link href="/" className="text-xl font-bold text-[var(--foreground)]">1of10</Link>
              <p className="mt-4 text-sm text-[var(--muted-foreground)] leading-relaxed">
                Autorisierte Software-Keys mit sofortiger Lieferung. Als freiwillige Kulanz erstatten wir jeden zehnten Kauf.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Shop</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/products" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Alle Produkte</Link></li>
                <li><Link href="/blog" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Ratgeber</Link></li>
                <li><Link href="/faq" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">FAQ</Link></li>
                <li><Link href="/transparenz" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Transparenz</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Rechtliches</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/impressum" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Impressum</Link></li>
                <li><Link href="/datenschutz" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Datenschutz</Link></li>
                <li><Link href="/agb" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">AGB</Link></li>
                <li><Link href="/widerruf" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Widerruf</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border)] py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--muted-foreground)]">&#169; 2026 1of10 &#183; Michael Hahnel &#183; Alle Preise Endpreise &#183; &#167;19 UStG</p>
            <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
              <span>Visa / Mastercard</span>
              <span>SSL</span>
              <span>M&#252;nchen, DE</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
