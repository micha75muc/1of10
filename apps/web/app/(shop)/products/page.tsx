import { prisma } from "@repo/db";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductImage, getCategoryLabel } from "./product-image";
import { WinnerTicker } from "./winner-ticker";
import { SearchBar } from "./search-bar";
import { CategoryFilter } from "./category-filter";
import { SortDropdown } from "./sort-dropdown";
import { Suspense } from "react";

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

  // Only show products with stock > 0 AND a DSD product code so we can
  // actually fulfill the order.
  where.stockLevel = { gt: 0 };
  where.dsdProductCode = { not: null };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    select: { id: true, sku: true, name: true, sellPrice: true, uvpPrice: true, brand: true, category: true, stockLevel: true, imageUrl: true },
  });

  // Only surface category chips that actually have at least one fulfillable
  // product — categories without DSD-mapped SKUs would otherwise lead to an
  // empty results page.
  const availableCategoryRows = await prisma.product.groupBy({
    by: ["category"],
    where: { stockLevel: { gt: 0 }, dsdProductCode: { not: null } },
    _count: { _all: true },
  });
  const availableCategories = availableCategoryRows
    .map((r) => r.category)
    .filter((c): c is string => !!c)
    .sort();

  return (
    <div className="py-2 sm:py-6">
      {/* Winner Ticker — quiet social proof, kept above the page header. */}
      <div className="mb-10">
        <WinnerTicker />
      </div>

      {/* Apple-style page header: large display type, secondary subtitle.
          No icon strips, no banners — the gold "every 10th refund" line
          already lives in the global top bar (shop layout). */}
      <header className="mb-10 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Shop
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">
          Antivirus, Office, Windows und mehr. Sofortige Lieferung per E-Mail.
          Wir erstatten freiwillig jeden 10. Kauf.
        </p>
      </header>

      {/* Filter row — single line, restrained. */}
      <div className="mb-8 sm:mb-10 space-y-4">
        <Suspense>
          <SearchBar />
          <div className="flex flex-wrap items-center gap-3">
            <CategoryFilter categories={availableCategories} />
            <SortDropdown />
            <p className="ml-auto text-sm text-[var(--muted-foreground)]">
              {products.length === 1 ? "1 Produkt" : `${products.length} Produkte`}
            </p>
          </div>
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-2xl font-semibold tracking-tight">
            {q || category
              ? "Keine Produkte gefunden"
              : "Aktuell keine Produkte verfügbar"}
          </p>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {q || category
              ? "Versuche einen anderen Suchbegriff oder entferne den Filter."
              : "Wir füllen das Sortiment gerade auf."}
          </p>
          {(q || category) && (
            <Link
              href="/products"
              className="mt-6 inline-block rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-medium text-[var(--primary-foreground)]"
            >
              Alle Produkte anzeigen
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const hasDiscount =
              product.uvpPrice && Number(product.uvpPrice) > Number(product.sellPrice);
            const lowStock = product.stockLevel > 0 && product.stockLevel <= 5;

            return (
              <Link
                key={product.id}
                href={`/products/${product.sku}`}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-2xl"
              >
                {/* Image tile — uniform neutral background for every product */}
                <div className="transition group-hover:opacity-90">
                  <ProductImage
                    name={product.name}
                    brand={product.brand}
                    category={product.category}
                    imageUrl={product.imageUrl}
                  />
                </div>

                {/* Apple-style card text: small caps brand line, name, price.
                    No CTA button — the entire card is the affordance. */}
                <div className="mt-5 px-1">
                  {product.brand && (
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                      {product.brand}
                      {product.category && (
                        <>
                          <span className="mx-1.5">·</span>
                          {getCategoryLabel(product.category)}
                        </>
                      )}
                    </p>
                  )}
                  <h2 className="mt-1.5 text-base font-semibold leading-snug tracking-tight group-hover:underline underline-offset-4">
                    {product.name}
                  </h2>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-semibold tracking-tight">
                      {Number(product.sellPrice).toFixed(2).replace(".", ",")}&nbsp;€
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-[var(--muted-foreground)] line-through">
                        {Number(product.uvpPrice).toFixed(2).replace(".", ",")}&nbsp;€
                      </span>
                    )}
                  </div>

                  {lowStock && (
                    <p className="mt-2 text-xs text-[var(--destructive)]">
                      Nur noch {product.stockLevel}× verfügbar
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
