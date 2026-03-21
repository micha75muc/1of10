import Link from "next/link";
import { Logo } from "../components/logo";
import { MobileNav } from "../components/mobile-nav";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Gamification Banner */}
      <div className="bg-[var(--gold)]/10 border-b border-[var(--gold)]/20 px-4 py-2 text-center text-sm">
        <span className="text-[var(--gold)] font-semibold">
          🏆 Wir erstatten jeden 10. Kauf
        </span>
        <span className="text-[var(--muted-foreground)]">
          {" "}— freiwillige Kulanzleistung für unsere Kunden
        </span>
      </div>

      {/* Header */}
      <header className="relative border-b px-6 py-4">
        <nav aria-label="Hauptnavigation" className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition">
            <Logo size="md" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm font-medium hover:text-[var(--primary)] transition"
            >
              Produkte
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium hover:text-[var(--primary)] transition"
            >
              Ratgeber
            </Link>
            <Link
              href="/transparenz"
              className="text-sm font-medium hover:text-[var(--primary)] transition"
            >
              Transparenz
            </Link>
            <Link
              href="/products"
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Jetzt kaufen
            </Link>
          </div>
          <MobileNav />
        </nav>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>

      {/* Footer */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--primary)]">✓</span> Original-Keys
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--primary)]">⚡</span> Sofort per E-Mail
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--primary)]">🔒</span> SSL &amp; DSGVO
            </div>
          </div>
          <nav aria-label="Rechtliche Informationen" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/impressum" className="hover:underline">Impressum</Link>
            <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
            <Link href="/agb" className="hover:underline">AGB</Link>
            <Link href="/widerruf" className="hover:underline">Widerrufsbelehrung</Link>
          </nav>
          <p className="mt-3 text-center text-[10px] text-[var(--muted-foreground)]">
            Alle Preise sind Endpreise. Gem. §19 UStG wird keine Umsatzsteuer erhoben.
          </p>
          {/* Uwe (UI): Payment + Trust Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span className="rounded border px-2 py-1">💳 Stripe Payments</span>
            <span className="rounded border px-2 py-1">🔒 256-bit SSL</span>
            <span className="rounded border px-2 py-1">🇩🇪 Deutscher Anbieter</span>
            <span className="rounded border px-2 py-1">📧 Sofort-Lieferung</span>
          </div>
          <div className="mt-4 flex justify-center">
            <Logo size="sm" />
          </div>
          <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
            © 2026 1of10 — Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
