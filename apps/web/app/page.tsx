import Link from "next/link";
import { LogoFull } from "./components/logo";
import { NewsletterSignup } from "./components/newsletter-signup";
import { prisma } from "@repo/db";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { stockLevel: { gt: 0 } },
    select: { id: true, sku: true, name: true, sellPrice: true, brand: true, category: true, stockLevel: true },
    orderBy: { sellPrice: "asc" },
  });

  return (
    <main className="min-h-screen">
      {/* Top Bar */}
      <div className="border-b border-[var(--gold)]/20 bg-[var(--gold)]/5 px-4 py-2 text-center text-sm">
        <span className="font-semibold text-[var(--gold)]">Wir erstatten jeden 10. Kauf</span>
        <span className="text-[var(--muted-foreground)] hidden sm:inline"> — als freiwillige Kulanzleistung</span>
      </div>

      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/">
            <LogoFull size="sm" />
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/products" className="font-medium hover:text-[var(--primary)] transition">Alle Produkte</Link>
            <Link href="/blog" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition">Ratgeber</Link>
            <Link href="/faq" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition">FAQ</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl sm:leading-[1.15]">
            Security-Software zum fairen Preis
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--muted-foreground)]">
            Autorisierte Keys von Norton, McAfee und Avast — sofort per E-Mail.
            Als freiwillige Kulanz erstatten wir jeden 10.&nbsp;Kauf vollständig.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-5 py-2 text-sm text-[var(--gold)]">
            <span className="h-2 w-2 rounded-full bg-[var(--gold)] animate-pulse" />
            Jeder 10. Kauf wird erstattet
          </div>
        </div>
      </section>

      {/* Produkte — DAS Herzstueck */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.sku}`}
                className="card-hover group flex flex-col rounded-2xl border border-[var(--border)]/50 bg-[var(--card)] overflow-hidden"
              >
                <div className="bg-gradient-to-br from-[var(--secondary)] to-[var(--muted)] p-8 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{p.brand}</p>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-sm font-semibold leading-snug group-hover:text-[var(--primary)] transition-colors">{p.name}</h3>
                  <div className="mt-auto pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold tracking-tight">{Number(p.sellPrice).toFixed(2).replace(".", ",")} €</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">Endpreis</span>
                    </div>
                    {p.stockLevel < 25 && (
                      <p className="mt-1.5 text-[10px] font-medium text-amber-400/80">Nur noch {p.stockLevel} verfügbar</p>
                    )}
                    <div className="btn-primary mt-4 rounded-xl bg-[var(--primary)] py-3 text-center text-sm font-semibold text-[var(--primary-foreground)]">
                      Zum Produkt
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* So funktionierts — 3 Schritte, minimalistisch */}
      <section id="so-funktionierts" className="scroll-mt-8 border-t bg-[var(--card)] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold">So funktioniert 1of10</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xl font-bold text-[var(--primary)]">1</div>
              <h3 className="font-semibold">Kaufen</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Wähle dein Produkt und bezahle sicher über Stripe.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xl font-bold text-[var(--primary)]">2</div>
              <h3 className="font-semibold">Erhalten</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Dein Key kommt sofort per E-Mail. Kein Warten.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold)]/10 text-xl font-bold text-[var(--gold)]">✓</div>
              <h3 className="font-semibold text-[var(--gold)]">Erstattung?</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Jeder 10. Kauf wird vollständig erstattet. Dein Produkt behältst du.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t px-6 py-12">
        <div className="mx-auto max-w-sm text-center">
          <h2 className="mb-2 text-lg font-bold">Auf dem Laufenden bleiben</h2>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">Neue Produkte und Erstattungs-Updates.</p>
          <NewsletterSignup variant="banner" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:items-start">
            {/* Brand */}
            <div>
              <LogoFull size="sm" />
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[var(--muted-foreground)]">
                Autorisierte Software-Keys. Sofortige Lieferung. Und als Kulanz erstatten wir jeden 10. Kauf.
              </p>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--muted-foreground)]">
              <Link href="/impressum" className="hover:text-[var(--foreground)] transition">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-[var(--foreground)] transition">Datenschutz</Link>
              <Link href="/agb" className="hover:text-[var(--foreground)] transition">AGB</Link>
              <Link href="/widerruf" className="hover:text-[var(--foreground)] transition">Widerruf</Link>
              <Link href="/transparenz" className="hover:text-[var(--foreground)] transition">Transparenz</Link>
            </nav>

            {/* Trust */}
            <div className="flex flex-col items-end gap-2 text-[10px] text-[var(--muted-foreground)]">
              <div className="flex items-center gap-3">
                <span className="rounded-md border px-2.5 py-1">Visa / Mastercard</span>
                <span className="rounded-md border px-2.5 py-1">Stripe</span>
              </div>
              <span>SSL-verschlüsselt · DSGVO-konform · München, DE</span>
            </div>
          </div>

          <div className="mt-8 border-t pt-4 text-center text-[10px] text-[var(--muted-foreground)]">
            © 2026 1of10 · Michael Hahnel · Alle Preise sind Endpreise · §19 UStG
          </div>
        </div>
      </footer>
    </main>
  );
}
