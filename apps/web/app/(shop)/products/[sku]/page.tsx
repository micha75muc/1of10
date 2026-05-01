import { prisma } from "@repo/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductImage, getCategoryLabel } from "../product-image";
import { getProductEnrichment } from "../../../../lib/product-data";
import { Check, Shield, Zap, Key, Monitor } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ sku: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10.de";

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { stockLevel: { gt: 0 }, dsdProductCode: { not: null } },
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
      images: product.imageUrl ? [{ url: product.imageUrl.startsWith("http") ? product.imageUrl : `${BASE_URL}${product.imageUrl}`, width: 400, height: 300, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { sku } = await params;
  const product = await prisma.product.findUnique({ where: { sku } });

  if (!product) {
    notFound();
  }

  // Treat products without a DSD product code as not-listed: even if they
  // exist in the DB, we can't deliver them automatically, so don't expose
  // a buy path. Same 404 as a missing SKU keeps the surface uniform.
  if (!product.dsdProductCode) {
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
      dsdProductCode: { not: null },
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
    image: product.imageUrl ? (product.imageUrl.startsWith("http") ? product.imageUrl : `${BASE_URL}${product.imageUrl}`) : undefined,
    // Note: aggregateRating/review removed — no real reviews exist yet.
    // Adding fabricated ratings violates Google Webmaster Guidelines.
    offers: {
      "@type": "Offer",
      price: Number(product.sellPrice).toFixed(2),
      priceCurrency: "EUR",
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability:
        product.stockLevel > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/products/${product.sku}`,
      seller: { "@type": "Organization", name: "1of10" },
      // Händlereinträge: Return Policy + Shipping
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "DE",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        merchantReturnDays: 0,
        returnMethod: "https://schema.org/ReturnByMail",
        description: "Digitale Produkte — kein Widerruf nach Aktivierung (§356 Abs. 5 BGB). Kulanz-Erstattung bei jedem 10. Kauf.",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "DE",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 0,
            unitCode: "MIN",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 5,
            unitCode: "MIN",
          },
        },
      },
    },
  };

  return (
    <div className="py-4">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
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
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: Image */}
        <div>
          <ProductImage
            name={product.name}
            brand={product.brand}
            category={product.category}
            imageUrl={product.imageUrl}
            size="hero"
          />

          {/* Highlights under image (desktop) */}
          {enrichment?.highlights && (
            <div className="hidden lg:flex flex-wrap gap-2 mt-6">
              {enrichment.highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                  <Check className="h-3 w-3 text-[var(--success)]" />
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          {/* Brand · Category — small caps, Apple-style */}
          {(product.brand || product.category) && (
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
              {product.brand}
              {product.brand && product.category && <span className="mx-1.5">·</span>}
              {product.category && getCategoryLabel(product.category)}
            </p>
          )}

          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-4 text-lg leading-relaxed text-[var(--muted-foreground)]">
              {product.description}
            </p>
          )}

          {/* Highlights (mobile) */}
          {enrichment?.highlights && (
            <div className="flex flex-wrap gap-2 mt-4 lg:hidden">
              {enrichment.highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                  <Check className="h-3 w-3 text-[var(--success)]" />
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="mt-8">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold tracking-tight">
                {Number(product.sellPrice).toFixed(2).replace(".", ",")}&nbsp;€
              </span>
              {product.uvpPrice && Number(product.uvpPrice) > Number(product.sellPrice) && (
                <>
                  <span className="text-base text-[var(--muted-foreground)] line-through">
                    {Number(product.uvpPrice).toFixed(2).replace(".", ",")} €
                  </span>
                  <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]">
                    −{Math.round((1 - Number(product.sellPrice) / Number(product.uvpPrice)) * 100)}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Endpreis · keine USt. nach §19 UStG</p>
          </div>

          {/* Stock */}
          <p className="mt-4 text-sm">
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
            <div className="mt-8">
              <h2 className="text-sm font-semibold mb-3">Im Paket enthalten</h2>
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

          {/* CTA — Apple pill button */}
          <Link
            href={`/checkout?productId=${product.id}`}
            aria-label={
              product.stockLevel > 0
                ? `${product.name} jetzt kaufen`
                : `${product.name} — ausverkauft`
            }
            className={`mt-8 block rounded-full px-6 py-3.5 text-center text-base font-medium transition ${
              product.stockLevel > 0
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-[0.99]"
                : "pointer-events-none bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {product.stockLevel > 0 ? "Jetzt kaufen" : "Ausverkauft"}
          </Link>

          {/* Refund line — single quiet sentence, no banner. */}
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            <span className="text-[var(--gold)]">●</span>{" "}
            Wir erstatten freiwillig jeden 10. Kauf — du behältst dein Produkt.
          </p>

          {/* Trust Signals — minimal, monochrome */}
          <div className="mt-8 grid grid-cols-3 gap-x-2 text-center text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-6">
            <div className="flex flex-col items-center gap-1.5">
              <Zap className="h-5 w-5" />
              Sofort-Download
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Key className="h-5 w-5" />
              Original-Key
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Shield className="h-5 w-5" />
              SSL-verschlüsselt
            </div>
          </div>

          {/* Vendor-Account Hinweis */}
          {product.requiresVendorAccount && (
            <p className="mt-4 rounded-lg bg-[var(--secondary)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
              <strong className="text-[var(--foreground)]">Aktivierung:</strong>{" "}
              {product.vendorName ?? "Der Hersteller"} verlangt ein kostenloses
              Konto (branchenüblich, ca. 2 Min). Wir führen dich nach dem Kauf
              Schritt für Schritt durch den Aktivierungsprozess.
            </p>
          )}
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

      {/* FAQ — falls Enrichment vorhanden, ansonsten Standard-FAQ (C6) */}
      {(() => {
        const enrichmentFaq = enrichment?.faq && enrichment.faq.length > 0 ? enrichment.faq : null;
        const standardFaq = [
          {
            q: "Bekomme ich eine Original-Lizenz?",
            a: `Ja. ${product.name} wird über autorisierte Distributoren bezogen — kein Grey Market, keine OEM-Restbestände aus Drittländern. Du erhältst einen offiziellen, beim Hersteller registrierbaren Aktivierungsschlüssel.`,
          },
          {
            q: "Wann wird die Lizenz geliefert?",
            a: "Sofort nach Zahlungseingang per E-Mail — typischerweise unter einer Minute. Falls die Mail nicht ankommt, prüfe bitte den Spam-Ordner oder kontaktiere uns über das Kontaktformular.",
          },
          {
            q: "Wie aktiviere ich das Produkt?",
            a: product.requiresVendorAccount
              ? `${product.vendorName ?? "Der Hersteller"} verlangt ein kostenloses Konto (ca. 2 Min). Wir senden dir mit dem Schlüssel eine genaue Anleitung — Schritt für Schritt, mit Screenshots.`
              : "Du kopierst den Aktivierungsschlüssel aus der E-Mail in das Hersteller-Programm. Eine kurze Anleitung liegt jeder Lieferung bei.",
          },
          {
            q: "Was passiert, wenn die Aktivierung nicht klappt?",
            a: "Schreib uns über das Kontaktformular — wir antworten innerhalb von 24 Stunden (werktags meist innerhalb weniger Stunden) und tauschen den Schlüssel im Zweifel kostenlos aus.",
          },
          {
            q: "Wie funktioniert die Erstattung bei jedem 10. Kauf?",
            a: "Wir nutzen ein nachvollziehbares Verfahren (siehe /transparenz): aus 10 Plätzen wird einer zufällig als Gewinner gezogen. Bei Treffer erstatten wir den vollen Kaufpreis automatisch über Stripe — du behältst die Lizenz. Es ist eine freiwillige Kulanzleistung, kein Rechtsanspruch.",
          },
          {
            q: "Ist mein Kauf sicher?",
            a: "Zahlung läuft komplett über Stripe (PCI-DSS Level 1, SSL-verschlüsselt). Wir sehen weder deine Kartendaten noch speichern wir sie. Hosting in Deutschland, DSGVO-konform.",
          },
        ];
        const faq = enrichmentFaq ?? standardFaq;
        return (
          <div className="rounded-xl border bg-[var(--card)] p-6 lg:col-span-2">
            <h2 className="text-base font-semibold mb-4">Häufige Fragen</h2>
            <div className="space-y-4">
              {faq.map((item, i) => (
                <div key={i} className="border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0">
                  <h3 className="text-sm font-semibold mb-1">{item.q}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* If no system req, FAQ takes full row */}
      {!enrichment?.systemReq && (
        <div className="hidden lg:block lg:col-span-1" />
      )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16 sm:mt-20">
          <h2 className="text-2xl font-semibold tracking-tight mb-8">Ähnliche Produkte</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
            {related.map((r) => (
              <Link
                key={r.sku}
                href={`/products/${r.sku}`}
                className="group block"
              >
                <div className="aspect-[4/3] w-full rounded-2xl bg-[var(--tile)] flex items-center justify-center transition group-hover:opacity-90">
                  <span className="text-base sm:text-lg font-semibold tracking-tight">{r.brand ?? "Software"}</span>
                </div>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-foreground)]">{r.brand}</p>
                <p className="mt-1 text-sm font-semibold leading-tight line-clamp-2 group-hover:underline underline-offset-4">{r.name}</p>
                <p className="mt-2 text-sm font-semibold">{Number(r.sellPrice).toFixed(2).replace(".", ",")} €</p>
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
