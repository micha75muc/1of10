import Link from "next/link";
import { Logo } from "./components/logo";
import { MobileNav } from "./components/mobile-nav";
import { NewsletterSignup } from "./components/newsletter-signup";
import { prisma } from "@repo/db";
import { ProductImage, getCategoryLabel } from "./(shop)/products/product-image";
import { Mail, Phone } from "lucide-react";

export default async function HomePage() {
  const featuredSkus = [
    "MCAFEE-IS-1PC-1Y", "MCAFEE-TP-1PC-1Y",
    "NORTON-360-DLX-VPN-3D-1Y", "NORTON-360-PREM-10D-1Y",
    "AVG-TUNEUP-3D-1Y", "AVG-IS-1PC-1Y",
    "AVAST-PREM-1PC-1Y",
    "PANDA-ESS-1PC-1Y", "PANDA-COMP-1PC-1Y",
    "BITDEF-AV-1PC-1Y", "BITDEF-TS-5D-1Y",
    "ESET-NOD32-3D-1Y",
    "GDATA-AV-1PC-1Y",
    "TREND-IS-1PC-1Y",
    "MS-OFFICE-HS-2021", "WIN11-PRO-OEM",
    "PARALLELS-18-STD-1Y",
    "ACRONIS-ESS-1PC-1Y",
  ];
  const products = await prisma.product.findMany({
    where: { sku: { in: featuredSkus }, stockLevel: { gt: 0 }, dsdProductCode: { not: null } },
    select: { id: true, sku: true, name: true, sellPrice: true, uvpPrice: true, brand: true, imageUrl: true, stockLevel: true, category: true },
    orderBy: { sellPrice: "asc" },
  });

  const totalProducts = await prisma.product.count({
    where: { stockLevel: { gt: 0 }, dsdProductCode: { not: null } },
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Quiet top strip — same treatment as shop layout for consistency */}
      <div className="border-b border-[var(--border)] bg-[var(--secondary)] text-center py-2 px-4">
        <span className="text-[13px] text-[var(--foreground)]">
          <span className="text-[var(--gold)]">●</span>{" "}
          <span className="font-medium">Wir erstatten jeden 10. Kauf</span>
          <span className="text-[var(--muted-foreground)]"> — freiwillige Kulanzleistung.</span>
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-8 hover:opacity-80 transition">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium">
              <Link href="/products" className="text-[var(--foreground)]/85 hover:text-[var(--foreground)] transition-colors">Shop</Link>
              <Link href="/blog" className="text-[var(--foreground)]/85 hover:text-[var(--foreground)] transition-colors">Ratgeber</Link>
              <Link href="/transparenz" className="text-[var(--foreground)]/85 hover:text-[var(--foreground)] transition-colors">Transparenz</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-1.5 text-[13px] font-medium text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Jetzt einkaufen
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero — Apple-style: large display heading, quiet subtext, two pills.
            No gradient, no pattern overlay, no gold callout pill. */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto pt-16 sm:pt-24 pb-12 sm:pb-20 text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
              Software, die du behältst.
              <br />
              <span className="text-[var(--muted-foreground)]">Vielleicht zum Nulltarif.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
              Antivirus, Office, Windows. Sofortige Lieferung per E-Mail.
              Wir erstatten freiwillig jeden 10. Kauf vollständig — du behältst dein Produkt in jedem Fall.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-[15px] font-medium hover:opacity-90 active:scale-[0.99] transition"
              >
                Shop ansehen
              </Link>
              <Link
                href="#so-funktionierts"
                className="inline-flex items-center justify-center h-11 px-6 rounded-full text-[15px] font-medium text-[var(--primary)] hover:underline underline-offset-4"
              >
                So funktioniert es ›
              </Link>
            </div>
          </div>
        </section>

        {/* Featured grid — same tile treatment as the shop. */}
        <section id="produkte" className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-12 sm:py-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Bestseller</h2>
                <p className="mt-2 text-[var(--muted-foreground)]">
                  Auswahl aus {totalProducts} Produkten.
                </p>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-block text-sm font-medium text-[var(--primary)] hover:underline underline-offset-4"
              >
                Alle ansehen ›
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {products.map((product) => {
                const hasUvp = product.uvpPrice && Number(product.uvpPrice) > Number(product.sellPrice);
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.sku}`}
                    className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                  >
                    <div className="transition group-hover:opacity-90">
                      <ProductImage
                        name={product.name}
                        brand={product.brand}
                        category={product.category}
                        imageUrl={product.imageUrl}
                      />
                    </div>
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
                      <h3 className="mt-1.5 text-base font-semibold leading-snug tracking-tight group-hover:underline underline-offset-4">
                        {product.name}
                      </h3>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-lg font-semibold tracking-tight">
                          {Number(product.sellPrice).toFixed(2).replace(".", ",")} €
                        </span>
                        {hasUvp && (
                          <span className="text-sm text-[var(--muted-foreground)] line-through">
                            {Number(product.uvpPrice).toFixed(2).replace(".", ",")} €
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[var(--secondary)] text-[15px] font-medium hover:bg-[var(--border)] transition"
              >
                Alle {totalProducts} Produkte ansehen
              </Link>
            </div>

            {/* Categories — same neutral tile pattern, no emojis. */}
            <div className="mt-20">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8 text-center">
                Nach Kategorie stöbern
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { cat: "Antivirus", desc: "Virenschutz" },
                  { cat: "Internet Security", desc: "Firewall &amp; Banking" },
                  { cat: "Total Security", desc: "Komplettschutz" },
                  { cat: "Office", desc: "Word, Excel &amp; Co." },
                  { cat: "Windows", desc: "Betriebssystem" },
                  { cat: "VPN", desc: "Privatsphäre" },
                  { cat: "Utilities", desc: "Tools" },
                  { cat: "Backup", desc: "Datensicherung" },
                  { cat: "Mac", desc: "Mac-Software" },
                ].map((c) => (
                  <Link
                    key={c.cat}
                    href={`/products?category=${encodeURIComponent(c.cat)}`}
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-[var(--tile)] p-6 hover:bg-[var(--border)] transition text-center"
                  >
                    <span className="text-base font-semibold tracking-tight">{c.cat}</span>
                    <span
                      className="text-xs text-[var(--muted-foreground)]"
                      dangerouslySetInnerHTML={{ __html: c.desc }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works — clean three-step, no colored dividers, big numerals. */}
        <section id="so-funktionierts" className="px-4 sm:px-6 lg:px-8 bg-[var(--secondary)]">
          <div className="max-w-7xl mx-auto py-16 sm:py-24">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                So funktioniert 1of10.
              </h2>
              <p className="mt-3 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Drei Schritte zu deiner Software — und der Möglichkeit einer vollständigen Erstattung.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
              {[
                {
                  n: "1",
                  title: "Produkt wählen",
                  body: `${totalProducts} Lizenzen aus den Bereichen Antivirus, Office, Windows und mehr.`,
                },
                {
                  n: "2",
                  title: "Sicher bezahlen",
                  body: "Über Stripe. Dein Lizenzschlüssel kommt sofort per E-Mail.",
                },
                {
                  n: "3",
                  title: "Erstattung prüfen",
                  body: "Direkt nach dem Kauf erfährst du, ob deine Bestellung als Kulanz erstattet wird. Deine Software behältst du in jedem Fall.",
                },
              ].map((s) => (
                <div key={s.n}>
                  <p className="text-5xl font-semibold tracking-tight text-[var(--muted-foreground)]/40">
                    {s.n}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[15px] text-[var(--muted-foreground)] leading-relaxed">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/transparenz"
                className="text-[15px] font-medium text-[var(--primary)] hover:underline underline-offset-4"
              >
                Wie wir den 10. Kauf bestimmen — Transparenz ›
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter — calm, no gradient. */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-16 sm:py-24">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Auf dem Laufenden bleiben.
              </h2>
              <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
                Neue Produkte, Angebote und Erstattungs-Updates per E-Mail.
              </p>
              <div className="mt-6 max-w-sm mx-auto">
                <NewsletterSignup variant="banner" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <Logo size="md" />
              </Link>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Autorisierte Software-Keys mit sofortiger Lieferung. Als freiwillige Kulanz erstatten wir jeden zehnten Kauf.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] mb-4 text-[var(--muted-foreground)]">Shop</h3>
              <ul className="space-y-3">
                <li><Link href="/products" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Alle Produkte</Link></li>
                <li><Link href="/blog" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Ratgeber</Link></li>
                <li><Link href="/transparenz" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Transparenz</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] mb-4 text-[var(--muted-foreground)]">Rechtliches</h3>
              <ul className="space-y-3">
                <li><Link href="/impressum" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Impressum</Link></li>
                <li><Link href="/datenschutz" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Datenschutz</Link></li>
                <li><Link href="/agb" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">AGB</Link></li>
                <li><Link href="/widerruf" className="text-sm text-[var(--foreground)] hover:underline underline-offset-4">Widerruf</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] mb-4 text-[var(--muted-foreground)]">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-sm text-[var(--foreground)]">
                  <Mail className="h-4 w-4 mr-2 shrink-0" />
                  info@medialess.de
                </li>
                <li className="flex items-center text-sm text-[var(--foreground)]">
                  <Phone className="h-4 w-4 mr-2 shrink-0" />
                  0152 25389619
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} 1of10 · Michael Hahnel · München
            </p>
            <div className="flex items-center gap-4">
              <a href="https://de.trustpilot.com/review/1of10.de" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition flex items-center gap-1">
                ★ Trustpilot
              </a>
              <p className="text-xs text-[var(--muted-foreground)]">
                Endpreise · gem. §19 UStG keine USt.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
