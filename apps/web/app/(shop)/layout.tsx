import Link from "next/link";

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
          🏆 Jeder 10. Kauf ist kostenlos
        </span>
        <span className="text-[var(--muted-foreground)]">
          {" "}— 10 % Chance auf volle Kaufpreiserstattung!
        </span>
      </div>

      {/* Header */}
      <header className="border-b px-6 py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-black text-[var(--primary-foreground)]">
              1
            </span>
            <span>
              of<span className="text-[var(--primary)]">10</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm font-medium hover:text-[var(--primary)] transition"
            >
              Produkte
            </Link>
            <Link
              href="/products"
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Jetzt kaufen
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>

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
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/impressum" className="hover:underline">Impressum</Link>
            <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
            <Link href="/agb" className="hover:underline">AGB</Link>
            <Link href="/widerruf" className="hover:underline">Widerrufsbelehrung</Link>
          </nav>
          <p className="mt-3 text-center text-[10px] text-[var(--muted-foreground)]">
            Alle Preise sind Endpreise. Gem. §19 UStG wird keine Umsatzsteuer erhoben.
          </p>
          <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
            © 2026 1of10 — Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
