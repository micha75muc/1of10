import { prisma } from "@repo/db";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductImage, getCategoryLabel } from "./product-image";
import { WinnerTicker } from "./winner-ticker";
import { SearchBar } from "./search-bar";
import { CategoryFilter } from "./category-filter";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Digitale Produkte kaufen — Antivirus, VPN, Plugins & mehr",
  description:
    "Günstige Software bei 1of10 kaufen. Antivirus, VPN, Audio-Plugins, Foto-Software & Game Keys. Sofort per E-Mail — und jeder 10. Kauf wird erstattet.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Digitale Produkte kaufen | 1of10",
    description:
      "Günstige Software. Sofort per E-Mail — jeder 10. Kauf wird vollständig erstattet.",
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

  const products = await prisma.product.findMany({
    where,
    orderBy,
    select: { id: true, sku: true, name: true, description: true, sellPrice: true, brand: true, category: true, stockLevel: true, imageUrl: true },
  });

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-6 text-6xl">📦</div>
        <h1 className="mb-4 text-3xl font-bold">Produkte</h1>
        <p className="mb-8 text-[var(--muted-foreground)]">
          Noch keine Produkte vorhanden.
        </p>
        <SeedButton />
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Winner Ticker — Social Proof */}
      <div className="mb-8">
        <WinnerTicker />
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold">Alle Produkte</h1>
        <p className="text-[var(--muted-foreground)]">
          Software, Games, Guthaben &amp; mehr — alles wird{" "}
          <span className="font-semibold text-[var(--primary)]">
            sofort per E-Mail
          </span>{" "}
          zugestellt.
        </p>
      </div>

      {/* Suche + Filter */}
      <div className="mb-6 space-y-4">
        <Suspense>
          <SearchBar />
          <CategoryFilter />
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
          {products.length} Produkte verfügbar
        </p>
      </div>
      {products.length === 0 && (q || category) ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-5xl">🔍</div>
          <p className="text-lg font-medium">Keine Produkte gefunden</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Versuche einen anderen Suchbegriff oder entferne den Filter.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]"
          >
            Alle Produkte anzeigen
          </Link>
        </div>
      ) : (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const isPopular = product.stockLevel > 30;

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
                {/* Badges */}
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  {isPopular && (
                    <span className="rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--gold)]">
                      ⭐ Bestseller
                    </span>
                  )}
                  <span className="rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                    ⚡ Sofort per E-Mail
                  </span>
                  <span className="rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--gold)]">
                    🎲 Jeder 10. Kauf wird erstattet
                  </span>
                  {product.category && (
                    <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                      {getCategoryLabel(product.category)}
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
                    <span className="text-2xl font-extrabold">
                      {Number(product.sellPrice).toFixed(2)}&nbsp;€
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

function SeedButton() {
  async function seedProducts() {
    "use server";

    const existing = await prisma.product.count();
    if (existing > 0) return;

    await prisma.product.createMany({
      data: [
        {
          sku: "WIN-11-PRO",
          name: "Microsoft Windows 11 Professional",
          costPrice: 8.50,
          sellPrice: 14.99,
          minimumMargin: 2.00,
          stockLevel: 100,
        },
        {
          sku: "WIN-11-HOME",
          name: "Microsoft Windows 11 Home",
          costPrice: 6.50,
          sellPrice: 11.99,
          minimumMargin: 1.50,
          stockLevel: 80,
        },
        {
          sku: "MS-365-BUS-STD",
          name: "Microsoft 365 Business Standard",
          costPrice: 10.20,
          sellPrice: 12.90,
          minimumMargin: 1.50,
          stockLevel: 50,
        },
        {
          sku: "MS-365-BUS-PREM",
          name: "Microsoft 365 Business Premium",
          costPrice: 18.00,
          sellPrice: 22.00,
          minimumMargin: 2.00,
          stockLevel: 30,
        },
        {
          sku: "MS-OFFICE-2024-PRO",
          name: "Microsoft Office 2024 Professional Plus",
          costPrice: 22.00,
          sellPrice: 29.99,
          minimumMargin: 3.00,
          stockLevel: 45,
        },
        {
          sku: "ADOBE-CC-ALL",
          name: "Adobe Creative Cloud All Apps (1 Jahr)",
          costPrice: 45.00,
          sellPrice: 54.99,
          minimumMargin: 5.00,
          stockLevel: 25,
        },
        {
          sku: "NORTON-360-DLX",
          name: "Norton 360 Deluxe Antivirus (1 Jahr)",
          costPrice: 8.00,
          sellPrice: 14.99,
          minimumMargin: 2.00,
          stockLevel: 60,
        },
        {
          sku: "KASPERSKY-PLUS",
          name: "Kaspersky Plus Antivirus (1 Jahr)",
          costPrice: 7.50,
          sellPrice: 12.99,
          minimumMargin: 2.00,
          stockLevel: 55,
        },
        {
          sku: "WIN-SRV-2022-STD",
          name: "Microsoft Windows Server 2022 Standard",
          costPrice: 120.00,
          sellPrice: 179.99,
          minimumMargin: 20.00,
          stockLevel: 15,
        },
      ],
    });
  }

  return (
    <form action={seedProducts}>
      <button
        type="submit"
        className="rounded-xl bg-[var(--primary)] px-8 py-4 text-lg font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
      >
        Demo-Produkte anlegen
      </button>
    </form>
  );
}
