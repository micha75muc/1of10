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

      {/* Hero — Kompakt, produkt-fokussiert */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Security-Software zum fairen Preis.
            <br />
            <span className="text-[var(--primary)]">Jeder 10. Kauf wird erstattet.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[var(--muted-foreground)]">
            Norton, McAfee, Avast — autorisierte Keys, sofort per E-Mail.
            Als Kulanzleistung erstatten wir jeden 10. Kauf vollständig.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[var(--muted-foreground)]">
            <span>✓ Sofort per E-Mail</span>
            <span>✓ Sichere Zahlung</span>
            <span>✓ Deutscher Anbieter</span>
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
                className="group flex flex-col rounded-xl border bg-[var(--card)] overflow-hidden hover:border-[var(--primary)]/50 transition-all hover:shadow-lg hover:shadow-[var(--primary)]/5"
              >
                <div className="bg-gradient-to-br from-[var(--secondary)] to-[var(--muted)] p-6 text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{p.brand}</p>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-semibold leading-snug group-hover:text-[var(--primary)] transition">{p.name}</h3>
                  <div className="mt-auto pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-extrabold">{Number(p.sellPrice).toFixed(2).replace(".", ",")} €</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">Endpreis</span>
                    </div>
                    {p.stockLevel < 25 && (
                      <p className="mt-1 text-[10px] text-amber-400">Nur noch {p.stockLevel} verfügbar</p>
                    )}
                    <div className="mt-3 rounded-lg bg-[var(--primary)] py-2.5 text-center text-sm font-semibold text-[var(--primary-foreground)] group-hover:opacity-90 transition">
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
      <footer className="border-t px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--muted-foreground)]">
              <Link href="/impressum" className="hover:underline">Impressum</Link>
              <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
              <Link href="/agb" className="hover:underline">AGB</Link>
              <Link href="/widerruf" className="hover:underline">Widerruf</Link>
              <Link href="/transparenz" className="hover:underline">Transparenz</Link>
            </nav>
            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
              <span>Visa / MC</span>
              <span>SSL</span>
              <span>München, DE</span>
            </div>
          </div>
          <p className="mt-4 text-center text-[10px] text-[var(--muted-foreground)]">
            © 2026 1of10 · Michael Hahnel · Alle Preise sind Endpreise · Gem. §19 UStG wird keine Umsatzsteuer erhoben
          </p>
        </div>
      </footer>
    </main>
  );
}
