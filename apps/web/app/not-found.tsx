import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl">🔍</div>
      <h1 className="mb-3 text-3xl font-bold">Seite nicht gefunden</h1>
      <p className="mb-8 max-w-md text-[var(--muted-foreground)]">
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </p>
      <div className="flex gap-4">
        <Link
          href="/products"
          className="rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
        >
          Zum Shop
        </Link>
        <Link
          href="/"
          className="rounded-xl border px-6 py-3 font-semibold hover:bg-[var(--secondary)] transition"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
