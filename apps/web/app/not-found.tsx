import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl" aria-hidden="true">🔍</div>
      <h1 className="mb-3 text-3xl font-bold">Seite nicht gefunden</h1>
      <p className="mb-6 max-w-md text-[var(--muted-foreground)]">
        Die angeforderte Seite existiert nicht oder wurde verschoben. Suche
        direkt nach einem Produkt — vielleicht findest du, was du gesucht hast:
      </p>

      <form
        method="GET"
        action="/products"
        role="search"
        className="mb-6 flex w-full max-w-md gap-2"
      >
        <label htmlFor="nf-search" className="sr-only">
          Produkte durchsuchen
        </label>
        <input
          id="nf-search"
          name="q"
          type="search"
          placeholder="z.B. Office, Antivirus, Cleaner…"
          autoComplete="off"
          className="flex-1 rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Suchen
        </button>
      </form>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-[var(--secondary)] transition"
        >
          Alle Produkte
        </Link>
        <Link
          href="/bestellstatus"
          className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-[var(--secondary)] transition"
        >
          Bestellung prüfen
        </Link>
        <Link
          href="/"
          className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-[var(--secondary)] transition"
        >
          Startseite
        </Link>
      </div>
    </div>
  );
}
