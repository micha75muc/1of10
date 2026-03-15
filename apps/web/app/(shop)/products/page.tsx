import { prisma } from "@repo/db";
import Link from "next/link";
import { ProductImage, getCategoryLabel } from "./product-image";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
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

      {/* Gamification Banner */}
      <div className="mb-8 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/20 text-3xl">
            🎲
          </div>
          <div>
            <p className="font-bold text-[var(--gold)]">
              Garantiert: Wir erstatten jeden 10. Kauf!
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Nicht &ldquo;vielleicht&rdquo; oder &ldquo;mit etwas Glück&rdquo; —
              wir garantieren, dass jeder 10. Kauf komplett erstattet wird.
              Du behältst dein Produkt trotzdem.
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const isPopular = product.stockLevel > 30;

          return (
            <div
              key={product.id}
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
                <Link
                  href={`/checkout?productId=${product.id}`}
                  className={`block rounded-lg px-4 py-3 text-center text-sm font-semibold transition ${
                    product.stockLevel > 0
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] pointer-events-none"
                  }`}
                >
                  {product.stockLevel > 0 ? "Jetzt kaufen" : "Ausverkauft"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
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
