import { prisma } from "@repo/db";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductImage, getCategoryLabel } from "./product-image";
import { WinnerTicker } from "./winner-ticker";
import { SearchBar } from "./search-bar";
import { CategoryFilter } from "./category-filter";
import { SortDropdown } from "./sort-dropdown";
import { Suspense } from "react";
import { Zap, Shield, Server, Lock, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Software kaufen — Antivirus, Office, Windows & mehr",
  description:
    "Günstige Software bei 1of10 kaufen. Norton, McAfee, Bitdefender, Trend Micro, Windows und Office. Sofort per E-Mail — jeder 10. Kauf wird erstattet.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Software kaufen | 1of10",
    description:
      "Antivirus, Office, Windows und mehr. Sofort per E-Mail — jeder 10. Kauf wird erstattet.",
  },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category ?? "";
  const sort = params.sort ?? "";

  // Prisma-Query mit URL-basiertem Filter
  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const orderBy: Record<string, string> =
    sort === "price-asc" ? { sellPrice: "asc" }
    : sort === "price-desc" ? { sellPrice: "desc" }
    : { name: "asc" };

  // Only show products with stock > 0
  where.stockLevel = { gt: 0 };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    select: { id: true, sku: true, name: true, description: true, sellPrice: true, uvpPrice: true, brand: true, category: true, stockLevel: true, imageUrl: true, requiresVendorAccount: true, vendorName: true },
  });

  return (
    <div className="py-4">
      {/* Winner Ticker — Social Proof */}
      <div className="mb-8">
        <WinnerTicker />
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="mb-3 text-3xl font-bold">Alle Produkte</h1>
        <p className="text-[var(--muted-foreground)]">
          Antivirus, Office, Windows &amp; mehr — alles wird{" "}
          <span className="font-semibold text-[var(--primary)]">
            sofort per E-Mail
          </span>{" "}
          zugestellt.
        </p>
      </div>

      {/* C4 — Trust-Bar above-the-fold: kompakt, sofort sichtbar.
          Auf <md scrollt der Strip horizontal, damit die Icons nicht zu klein werden. */}
      <div className="mb-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-max items-center gap-2 sm:min-w-0 sm:gap-3 sm:flex-wrap">
          <li className="inline-flex items-center gap-1.5 rounded-full border bg-[var(--card)] px-3 py-1.5 text-xs font-medium">
            <Zap className="h-3.5 w-3.5 text-[var(--brand-teal)]" />
            Sofort-Lieferung
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border bg-[var(--card)] px-3 py-1.5 text-xs font-medium">
            <Shield className="h-3.5 w-3.5 text-[var(--brand-blue)]" />
            Stripe-Zahlung
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border bg-[var(--card)] px-3 py-1.5 text-xs font-medium">
            <Server className="h-3.5 w-3.5 text-[var(--gold)]" />
            Hosting in DE
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border bg-[var(--card)] px-3 py-1.5 text-xs font-medium">
            <Lock className="h-3.5 w-3.5 text-[var(--brand-blue)]" />
            SSL-verschlüsselt
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border bg-[var(--card)] px-3 py-1.5 text-xs font-medium">
            <Key className="h-3.5 w-3.5 text-[var(--brand-teal)]" />
            Original-Keys
          </li>
        </ul>
      </div>

      {/* Suche + Filter + Sort */}
      <div className="mb-6 space-y-4">
        <Suspense>
          <SearchBar />
          <div className="flex flex-wrap items-center gap-4">
            <CategoryFilter />
            <SortDropdown />
          </div>
        </Suspense>
      </div>

      {/* Gamification Banner */}
      <div className="mb-8 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/20 text-3xl">
            🎲
          </div>
          <div>
            <p className="font-bold text-[var(--gold)]">
              Kulanz: Wir erstatten jeden 10. Kauf!
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Freiwillige Kulanzleistung — statistisch wird jeder 10. Kauf
              komplett erstattet. Du behältst dein Produkt in jedem Fall.
              Es besteht kein Rechtsanspruch.
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          {products.length === 1 ? "1 Produkt" : `${products.length} Produkte`} verfügbar
        </p>
      </div>
      {products.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-5xl" aria-hidden="true">🔍</div>
          <p className="text-lg font-medium">
            {q || category
              ? "Keine Produkte gefunden"
              : "Aktuell keine Produkte verfügbar"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {q || category
              ? "Versuche einen anderen Suchbegriff oder entferne den Filter."
              : "Wir füllen das Sortiment gerade auf — schau in Kürze wieder rein."}
          </p>
          {(q || category) && (
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
            >
              Alle Produkte anzeigen
            </Link>
          )}
        </div>
      ) : (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          return (
            <Link
              key={product.id}
              href={`/products/${product.sku}`}
              className="group relative flex flex-col rounded-xl border bg-[var(--card)] overflow-hidden transition hover:border-[var(--primary)]/50 hover:shadow-lg hover:shadow-[var(--primary)]/5"
            >
              {/* Product Image */}
              <ProductImage
                name={product.name}
                brand={product.brand}
                category={product.category}
                imageUrl={product.imageUrl}
              />

              <div className="flex flex-1 flex-col px-5 pb-5">
                {/* Badges — max 2, category + optional stock warning */}
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  {product.category && (
                    <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                      {getCategoryLabel(product.category)}
                    </span>
                  )}
                  {product.brand && (
                    <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                      {product.brand}
                    </span>
                  )}
                  {product.requiresVendorAccount && (
                    <span
                      title="Aktivierung erfordert kostenloses Hersteller-Konto"
                      className="rounded-full border border-[var(--brand-blue)]/40 bg-[var(--brand-blue)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--brand-blue)]"
                    >
                      Hersteller-Konto nötig
                    </span>
                  )}
                  {product.stockLevel > 0 && product.stockLevel <= 5 && (
                    <span className="rounded-full bg-[var(--destructive)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--destructive)]">
                      Nur noch {product.stockLevel}×
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <h2 className="mb-1 text-base font-bold leading-tight group-hover:text-[var(--primary)] transition">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="mb-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
                    {product.description}
                  </p>
                )}

                {/* Price + Stock */}
                <div className="mt-auto mb-4 flex items-end justify-between">
                  <div>
                    {product.uvpPrice && Number(product.uvpPrice) > Number(product.sellPrice) && (
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs text-[var(--muted-foreground)] line-through">
                          UVP {Number(product.uvpPrice).toFixed(2).replace(".", ",")}&nbsp;€
                        </span>
                        <span className="rounded-full bg-[var(--destructive)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          -{Math.round((1 - Number(product.sellPrice) / Number(product.uvpPrice)) * 100)}%
                        </span>
                      </div>
                    )}
                    <span className="text-2xl font-extrabold">
                      {Number(product.sellPrice).toFixed(2).replace(".", ",")}&nbsp;€
                    </span>
                    <span className="ml-1 text-[10px] text-[var(--muted-foreground)]">
                      Endpreis
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    {product.stockLevel > 0 ? (
                      <>
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)] mr-0.5" />
                        {product.stockLevel} verfügbar
                      </>
                    ) : (
                      <>
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--destructive)] mr-0.5" />
                        Ausverkauft
                      </>
                    )}
                  </p>
                </div>

                {/* CTA */}
                <span
                  aria-label={product.stockLevel > 0 ? `${product.name} — Details ansehen` : `${product.name} — ausverkauft`}
                  className={`block rounded-lg px-4 py-3 text-center text-sm font-semibold transition ${
                    product.stockLevel > 0
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] group-hover:opacity-90"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {product.stockLevel > 0 ? "Details ansehen" : "Ausverkauft"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}
