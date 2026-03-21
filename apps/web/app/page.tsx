import Link from "next/link";
import { LogoFull } from "./components/logo";
import { NewsletterSignup } from "./components/newsletter-signup";
import { prisma } from "@repo/db";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { stockLevel: { gt: 0 } },
    select: { id: true, sku: true, name: true, sellPrice: true, brand: true, stockLevel: true, description: true },
    orderBy: { sellPrice: "asc" },
  });

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="shrink-0"><LogoFull size="sm" /></Link>
          <div className="hidden sm:flex items-center gap-8 text-[13px]">
            <Link href="/products" className="text-[var(--muted-foreground)] hover:text-white transition-colors">Produkte</Link>
            <Link href="/faq" className="text-[var(--muted-foreground)] hover:text-white transition-colors">FAQ</Link>
            <Link href="/blog" className="text-[var(--muted-foreground)] hover:text-white transition-colors">Ratgeber</Link>
            <Link href="/products" className="rounded-full bg-white px-5 py-2 text-[13px] font-medium text-black hover:bg-white/90 transition">
              Jetzt kaufen
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 pt-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 via-transparent to-transparent pointer-events-none" />
        <p className="mb-6 text-[13px] font-medium uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
          Autorisierte Software-Keys &middot; Sofort per E-Mail
        </p>
        <h1 className="max-w-4xl text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-tight">
          Jeder zehnte Kauf<br />
          <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--gold)] bg-clip-text text-transparent">
            wird erstattet.
          </span>
        </h1>
        <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-[var(--muted-foreground)]">
          Norton, McAfee, Avast und mehr. Faire Preise, sofortige Lieferung.
          Und als freiwillige Kulanz: Sie erhalten bei jedem zehnten Kauf
          den vollen Betrag zurück.
        </p>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link href="/products" className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black hover:bg-white/90 transition shadow-lg shadow-white/10">
            Alle Produkte
          </Link>
          <a href="#wie-es-funktioniert" className="rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white/80 hover:text-white hover:border-white/40 transition">
            Wie es funktioniert
          </a>
        </div>
      </section>

      {/* ── PRODUKTE ── */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Unsere Produkte</p>
          <h2 className="mb-16 text-4xl font-bold tracking-tight">
            Security-Software ab 14,99&nbsp;&euro;
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.sku}`}
                className="group relative rounded-3xl bg-[var(--card)] p-8 transition-all duration-300 hover:bg-[var(--secondary)] hover:scale-[1.02]"
              >
                {/* Brand */}
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  {p.brand}
                </p>

                {/* Name */}
                <h3 className="mt-3 text-lg font-semibold leading-tight text-white/90 group-hover:text-white transition-colors">
                  {p.name}
                </h3>

                {/* Description snippet */}
                {p.description && (
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted-foreground)] line-clamp-2">
                    {p.description}
                  </p>
                )}

                {/* Price + CTA */}
                <div className="mt-8 flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-bold tracking-tight">{Number(p.sellPrice).toFixed(2).replace(".", ",")} &euro;</span>
                    <span className="ml-2 text-xs text-[var(--muted-foreground)]">Endpreis</span>
                  </div>
                  <span className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium text-white/70 group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)] transition-all">
                    Kaufen
                  </span>
                </div>

                {/* Urgency */}
                {p.stockLevel < 25 && (
                  <p className="mt-4 text-[11px] text-amber-400/70">Nur noch {p.stockLevel} verfügbar</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WIE ES FUNKTIONIERT ── */}
      <section id="wie-es-funktioniert" className="scroll-mt-16 px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-[13px] font-medium uppercase tracking-[0.25em] text-[var(--muted-foreground)]">So einfach</p>
          <h2 className="mb-20 text-center text-4xl font-bold tracking-tight">Drei Schritte zum Kauf</h2>

          <div className="grid gap-16 sm:grid-cols-3">
            <div>
              <div className="mb-6 text-5xl font-extralight text-[var(--muted-foreground)]">01</div>
              <h3 className="mb-3 text-xl font-semibold">Produkt wählen</h3>
              <p className="text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                Wählen Sie Ihre Software. Alle Produkte kommen von autorisierten Distributoren.
              </p>
            </div>
            <div>
              <div className="mb-6 text-5xl font-extralight text-[var(--muted-foreground)]">02</div>
              <h3 className="mb-3 text-xl font-semibold">Sicher bezahlen</h3>
              <p className="text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                Zahlung über Stripe. Ihr Lizenzschluessel wird sofort per E-Mail zugestellt.
              </p>
            </div>
            <div>
              <div className="mb-6 text-5xl font-extralight text-[var(--gold)]">03</div>
              <h3 className="mb-3 text-xl font-semibold">Erstattung prüfen</h3>
              <p className="text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                Nach dem Kauf erfahren Sie sofort, ob Ihr Kauf als Kulanzleistung erstattet wird. Ihre Software behalten Sie in jedem Fall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-tight">Nichts verpassen</h2>
          <p className="mb-8 text-[15px] text-[var(--muted-foreground)]">Neue Produkte und Erstattungs-Updates direkt in Ihr Postfach.</p>
          <NewsletterSignup variant="banner" />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 sm:grid-cols-3">
            <div>
              <LogoFull size="sm" />
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                Autorisierte Software-Keys mit sofortiger Lieferung. Als freiwillige Kulanz erstatten wir jeden zehnten Kauf.
              </p>
            </div>
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Navigation</p>
              <div className="flex flex-col gap-3 text-[13px]">
                <Link href="/products" className="text-[var(--muted-foreground)] hover:text-white transition-colors">Alle Produkte</Link>
                <Link href="/blog" className="text-[var(--muted-foreground)] hover:text-white transition-colors">Ratgeber</Link>
                <Link href="/faq" className="text-[var(--muted-foreground)] hover:text-white transition-colors">FAQ</Link>
                <Link href="/transparenz" className="text-[var(--muted-foreground)] hover:text-white transition-colors">Transparenz</Link>
                <Link href="/about" className="text-[var(--muted-foreground)] hover:text-white transition-colors">Über uns</Link>
              </div>
            </div>
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Rechtliches</p>
              <div className="flex flex-col gap-3 text-[13px]">
                <Link href="/impressum" className="text-[var(--muted-foreground)] hover:text-white transition-colors">Impressum</Link>
                <Link href="/datenschutz" className="text-[var(--muted-foreground)] hover:text-white transition-colors">Datenschutz</Link>
                <Link href="/agb" className="text-[var(--muted-foreground)] hover:text-white transition-colors">AGB</Link>
                <Link href="/widerruf" className="text-[var(--muted-foreground)] hover:text-white transition-colors">Widerrufsbelehrung</Link>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-[11px] text-[var(--muted-foreground)]">
              &copy; 2026 1of10 &middot; Michael Hahnel &middot; Muenchen
            </p>
            <div className="flex items-center gap-4 text-[11px] text-[var(--muted-foreground)]">
              <span>Visa / Mastercard</span>
              <span className="h-3 w-px bg-white/10" />
              <span>SSL</span>
              <span className="h-3 w-px bg-white/10" />
              <span>Alle Preise Endpreise &middot; &sect;19 UStG</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
