import { prisma } from "@repo/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductImage, getCategoryLabel } from "../product-image";

interface ProductPageProps {
  params: Promise<{ sku: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10.de";

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { sku: true },
  });
  return products.map((p) => ({ sku: p.sku }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { sku } = await params;
  const product = await prisma.product.findUnique({ where: { sku } });

  if (!product) {
    return { title: "Produkt nicht gefunden" };
  }

  const title = `${product.name} günstig kaufen`;
  const description = product.description
    ? `${product.description} — Jetzt für nur ${Number(product.sellPrice).toFixed(2)} € bei 1of10. Sofort per E-Mail. Jeder 10. Kauf wird erstattet.`
    : `${product.name} für nur ${Number(product.sellPrice).toFixed(2)} € bei 1of10 kaufen. Sofort per E-Mail — und jeder 10. Kauf wird vollständig erstattet.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.sku}` },
    openGraph: {
      title: `${product.name} | 1of10`,
      description,
      url: `${BASE_URL}/products/${product.sku}`,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { sku } = await params;
  const product = await prisma.product.findUnique({ where: { sku } });

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description:
      product.description ??
      `${product.name} — Software-Lizenz bei 1of10 kaufen.`,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    image: product.imageUrl ?? undefined,
    offers: {
      "@type": "Offer",
      price: Number(product.sellPrice).toFixed(2),
      priceCurrency: "EUR",
      availability:
        product.stockLevel > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/products/${product.sku}`,
      seller: { "@type": "Organization", name: "1of10" },
    },
  };

  return (
    <div className="py-4">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
          <li>
            <Link href="/" className="hover:text-[var(--foreground)] transition">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/products"
              className="hover:text-[var(--foreground)] transition"
            >
              Produkte
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-[var(--foreground)]">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Produktbild */}
        <div>
          <ProductImage
            name={product.name}
            brand={product.brand}
            category={product.category}
            imageUrl={product.imageUrl}
          />
        </div>

        {/* Produktinfo */}
        <div className="flex flex-col">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {product.brand && (
              <span className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                {product.brand}
              </span>
            )}
            {product.category && (
              <span className="rounded-full bg-[var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                {getCategoryLabel(product.category)}
              </span>
            )}
          </div>

          <h1 className="mb-3 text-2xl font-bold leading-tight md:text-3xl">
            {product.name}
          </h1>

          {product.description && (
            <p className="mb-4 leading-relaxed text-[var(--muted-foreground)]">
              {product.description}
            </p>
          )}

          {/* Preis */}
          <div className="mb-4">
            <span className="text-3xl font-extrabold">
              {Number(product.sellPrice).toFixed(2)}&nbsp;€
            </span>
            <span className="ml-2 text-sm text-[var(--muted-foreground)]">
              Endpreis
            </span>
          </div>

          {/* Verfügbarkeit */}
          <p className="mb-5 text-sm">
            {product.stockLevel > 0 ? (
              <span className="flex items-center gap-1.5 text-[var(--primary)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--primary)]" />
                {product.stockLevel} Stück verfügbar
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[var(--destructive)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--destructive)]" />
                Ausverkauft
              </span>
            )}
          </p>

          {/* Gamification Badge */}
          <div className="mb-6 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎲</span>
              <div>
                <p className="font-bold text-[var(--gold)]">
                  10% Chance auf volle Erstattung!
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Freiwillige Kulanzleistung — du behältst dein Produkt in jedem
                  Fall.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/checkout?productId=${product.id}`}
            aria-label={
              product.stockLevel > 0
                ? `${product.name} jetzt kaufen`
                : `${product.name} — ausverkauft`
            }
            className={`mb-6 block rounded-lg px-6 py-4 text-center text-base font-semibold transition ${
              product.stockLevel > 0
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                : "pointer-events-none bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {product.stockLevel > 0 ? "Jetzt kaufen" : "Ausverkauft"}
          </Link>

          {/* Trust-Signale */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-[var(--muted-foreground)]">
            <div className="rounded-lg border bg-[var(--card)] p-3">
              <span className="mb-1 block text-lg">⚡</span>
              Sofort-Download
            </div>
            <div className="rounded-lg border bg-[var(--card)] p-3">
              <span className="mb-1 block text-lg">🔑</span>
              Original-Key
            </div>
            <div className="rounded-lg border bg-[var(--card)] p-3">
              <span className="mb-1 block text-lg">🔒</span>
              SSL-verschlüsselt
            </div>
          </div>
        </div>
      </div>

      {/* Zurück-Link */}
      <div className="mt-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline transition"
        >
          ← Alle Produkte anzeigen
        </Link>
      </div>
      {/* Gregor (Growth): Sticky Mobile CTA */}
      {product.stockLevel > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-[var(--background)]/95 backdrop-blur p-3 md:hidden">
          <div className="flex items-center justify-between gap-3 mx-auto max-w-lg">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{product.name}</p>
              <p className="text-lg font-extrabold text-[var(--primary)]">{Number(product.sellPrice).toFixed(2)} €</p>
            </div>
            <Link
              href={`/checkout?productId=${product.id}`}
              className="shrink-0 rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-bold text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Kaufen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
