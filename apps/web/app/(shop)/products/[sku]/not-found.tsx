import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="py-16 text-center">
      <div className="mb-6 text-6xl">🔍</div>
      <h1 className="mb-3 text-3xl font-bold">Produkt nicht gefunden</h1>
      <p className="mb-8 text-[var(--muted-foreground)]">
        Das gesuchte Produkt existiert nicht oder ist nicht mehr verfügbar.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
      >
        ← Alle Produkte anzeigen
      </Link>
    </div>
  );
}
