import { prisma } from "@repo/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductImage, getCategoryLabel } from "../product-image";
import { getProductEnrichment } from "../../../../lib/product-data";
import { Check, Shield, Zap, Key, Gift, ChevronDown, Monitor } from "lucide-react";

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

  const enrichment = getProductEnrichment(sku);

  // Related products: same brand or category, exclude self
  const related = await prisma.product.findMany({
    where: {
      OR: [
        { brand: product.brand },
        { category: product.category },
      ],
      NOT: { sku: product.sku },
      stockLevel: { gt: 0 },
    },
    take: 4,
    orderBy: { sellPrice: "asc" },
    select: { sku: true, name: true, brand: true, sellPrice: true, category: true },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description:
      product.description ??
      `${product.name} — Software bei 1of10 kaufen.`,
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
            <Link href="/products" className="hover:text-[var(--foreground)] transition">
              Produkte
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-[var(--foreground)] truncate max-w-[200px]">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Product Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Image */}
        <div>
          <ProductImage
            name={product.name}
            brand={product.brand}
            category={product.category}
            imageUrl={product.imageUrl}
          />

          {/* Highlights under image (desktop) */}
          {enrichment?.highlights && (
            <div className="hidden lg:flex flex-wrap gap-2 mt-4">
              {enrichment.highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 px-3 py-1 text-xs font-medium text-[var(--gold)]">
                  <Check className="h-3 w-3" />
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {product.brand && (
              <span className="rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--primary)]">
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

          {/* Highlights (mobile) */}
          {enrichment?.highlights && (
            <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
              {enrichment.highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 px-3 py-1 text-xs font-medium text-[var(--gold)]">
                  <Check className="h-3 w-3" />
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="mb-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">
              {Number(product.sellPrice).toFixed(2).replace(".", ",")}&nbsp;€
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">
              Endpreis
            </span>
          </div>

          {/* Stock */}
          <p className="mb-5 text-sm">
            {product.stockLevel > 0 ? (
              <span className="flex items-center gap-1.5 text-[var(--success)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--success)]" />
                Auf Lager — sofortige Lieferung per E-Mail
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[var(--destructive)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--destructive)]" />
                Ausverkauft
              </span>
            )}
          </p>

          {/* Feature List */}
          {enrichment?.features && (
            <div className="mb-6 rounded-xl border bg-[var(--card)] p-4">
              <h2 className="text-sm font-semibold mb-3">Im Paket enthalten:</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {enrichment.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                    <Check className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Kulanz Badge */}
          <div className="mb-6 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-[var(--gold)] shrink-0" />
              <div>
                <p className="font-semibold text-[var(--gold)]">
                  Jeder 10. Kauf wird erstattet
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Freiwillige Kulanzleistung — du behältst dein Produkt in jedem Fall.
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
                ? "bg-[var(--foreground)] text-[var(--primary-foreground)] hover:scale-[1.01] active:scale-[0.99]"
                : "pointer-events-none bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {product.stockLevel > 0 ? "Jetzt kaufen" : "Ausverkauft"}
          </Link>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-[var(--muted-foreground)]">
            <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-[var(--card)] p-3">
              <Zap className="h-5 w-5 text-[var(--brand-teal)]" />
              Sofort-Download
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-[var(--card)] p-3">
              <Key className="h-5 w-5 text-[var(--brand-blue)]" />
              Original-Key
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-[var(--card)] p-3">
              <Shield className="h-5 w-5 text-[var(--gold)]" />
              SSL-verschlüsselt
            </div>
          </div>
        </div>
      </div>

      {/* Below the fold: Details */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* System Requirements */}
        {enrichment?.systemReq && (
          <div className="rounded-xl border bg-[var(--card)] p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
              <Monitor className="h-5 w-5 text-[var(--muted-foreground)]" />
              Systemanforderungen
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              {enrichment.systemReq}
            </p>
          </div>
        )}

        {/* FAQ */}
        {enrichment?.faq && enrichment.faq.length > 0 && (
          <div className="rounded-xl border bg-[var(--card)] p-6 lg:col-span-2">
            <h2 className="text-base font-semibold mb-4">Häufige Fragen</h2>
            <div className="space-y-4">
              {enrichment.faq.map((item, i) => (
                <div key={i} className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                  <h3 className="text-sm font-semibold mb-1">{item.q}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If no FAQ, system req takes full width */}
        {(!enrichment?.faq || enrichment.faq.length === 0) && enrichment?.systemReq && (
          <div className="lg:col-span-2" />
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Ähnliche Produkte</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.sku}
                href={`/products/${r.sku}`}
                className="rounded-xl border bg-[var(--card)] p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-1">{r.brand}</p>
                <p className="text-sm font-semibold leading-tight mb-2 line-clamp-2">{r.name}</p>
                <p className="text-lg font-bold">{Number(r.sellPrice).toFixed(2).replace(".", ",")} €</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline transition"
        >
          ← Alle Produkte anzeigen
        </Link>
      </div>

      {/* Mobile sticky CTA */}
      {product.stockLevel > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-[var(--background)]/95 backdrop-blur p-3 lg:hidden">
          <div className="flex items-center justify-between gap-3 mx-auto max-w-lg">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{product.name}</p>
              <p className="text-lg font-extrabold">{Number(product.sellPrice).toFixed(2).replace(".", ",")} €</p>
            </div>
            <Link
              href={`/checkout?productId=${product.id}`}
              className="shrink-0 rounded-lg bg-[var(--foreground)] px-5 py-3 text-sm font-bold text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Kaufen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
