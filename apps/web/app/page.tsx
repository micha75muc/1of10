import Link from "next/link";
import { WinnerTicker } from "./(shop)/products/winner-ticker";
import { LogoFull } from "./components/logo";
import { NewsletterSignup } from "./components/newsletter-signup";
import { prisma } from "@repo/db";

export default async function HomePage() {
  // Featured products direkt auf Landing — Besucher sehen sofort Preise
  const featuredProducts = await prisma.product.findMany({
    where: { stockLevel: { gt: 0 } },
    select: { id: true, sku: true, name: true, sellPrice: true, brand: true },
    orderBy: { sellPrice: "asc" },
    take: 3,
  });

  return (
    <main id="main-content" className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)]/10 px-4 py-1.5 text-sm text-[var(--gold)]">
          <span>🏆</span>
          <span className="font-semibold">Wir erstatten jeden 10. Kauf</span>
        </div>
        <div className="mb-8">
          <LogoFull size="lg" />
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl">
          Digitale Produkte.
          <br />
          <span className="text-[var(--primary)]">Wir erstatten jeden 10. Kauf.</span>
        </h1>
        <p className="mb-10 max-w-xl text-lg text-[var(--muted-foreground)]">
          Software, Games, Guthaben &amp; mehr —{" "}
          <span className="font-semibold text-[var(--foreground)]">sofort per E-Mail</span>.
          Bei jeder Bestellung hast du die Möglichkeit, dass dein Kauf vollständig
          erstattet wird — Dein Produkt behältst du in jedem Fall.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/products"
            className="rounded-xl bg-[var(--primary)] px-8 py-4 text-lg font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
          >
            Zum Shop →
          </Link>
          <a
            href="#so-funktionierts"
            className="rounded-xl border border-[var(--border)] px-8 py-4 text-lg font-semibold hover:bg-[var(--secondary)] transition"
          >
            So funktioniert&apos;s
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--primary)] text-lg">✓</span>
            <span>100 % Original-Keys</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--primary)] text-lg">⚡</span>
            <span>Sofort-Download per E-Mail</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--primary)] text-lg">🔒</span>
            <span>SSL-verschlüsselt &amp; DSGVO-konform</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--gold)] text-lg">🎲</span>
            <span>Freiwillige Erstattung jeden 10. Kaufs</span>
          </div>
        </div>
      </section>

      {/* Winner Ticker — Social Proof */}
      <WinnerTicker />

      {/* FEATURED PRODUCTS — Besucher sehen sofort was es kostet */}
      <section className="border-t px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-center text-2xl font-bold">Beliebteste Produkte</h2>
          <p className="mb-8 text-center text-sm text-[var(--muted-foreground)]">Sofort per E-Mail — jeder 10. Kauf wird erstattet</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {featuredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.sku}`}
                className="group rounded-xl border bg-[var(--card)] p-6 hover:border-[var(--primary)] transition"
              >
                <p className="text-xs font-medium text-[var(--muted-foreground)]">{p.brand}</p>
                <h3 className="mt-1 font-bold group-hover:text-[var(--primary)] transition">{p.name}</h3>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-2xl font-extrabold text-[var(--primary)]">
                    {Number(p.sellPrice).toFixed(2).replace('.', ',')} €
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">Endpreis</span>
                </div>
                <div className="mt-3 rounded-lg bg-[var(--primary)] py-2 text-center text-sm font-semibold text-[var(--primary-foreground)] group-hover:opacity-90 transition">
                  Details ansehen →
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/products" className="text-sm font-medium text-[var(--primary)] hover:underline">
              Alle {featuredProducts.length < 12 ? "12" : ""} Produkte ansehen →
            </Link>
          </div>
        </div>
      </section>

      {/* Inge + Clara: Warum 1of10? — Emotional USP Section */}
      <section className="border-t px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Warum bei <span className="text-[var(--gold)]">1of10</span> kaufen?
          </h2>
          <p className="mb-10 text-[var(--muted-foreground)]">
            Gleiche Software. Gleiche Preise. Aber nur bei uns bekommst du eine echte Chance, dass dein Kauf erstattet wird.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border bg-[var(--card)] p-6 text-left">
              <div className="mb-3 text-3xl">🏷️</div>
              <h3 className="mb-2 font-bold">Faire Preise</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Autorisierte Software vom deutschen Distributor. Keine Graumarkt-Keys, keine Risiken.</p>
            </div>
            <div className="rounded-xl border-2 border-[var(--gold)]/40 bg-[var(--gold)]/5 p-6 text-left">
              <div className="mb-3 text-3xl">🎲</div>
              <h3 className="mb-2 font-bold text-[var(--gold)]">Jeder 10. Kauf erstattet</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Freiwillige Kulanzleistung — du zahlst den normalen Preis, aber statistisch bekommst du bei jedem 10. Kauf alles zurück.</p>
            </div>
            <div className="rounded-xl border bg-[var(--card)] p-6 text-left">
              <div className="mb-3 text-3xl">⚡</div>
              <h3 className="mb-2 font-bold">Sofort-Lieferung</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Dein Lizenzschlüssel kommt direkt per E-Mail. Kein Warten, kein Postweg.</p>
            </div>
          </div>

          {/* Inge: Competitor comparison */}
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 pr-4 font-semibold"></th>
                  <th className="py-3 pr-4 font-semibold text-[var(--gold)]">1of10</th>
                  <th className="py-3 pr-4 font-semibold">Amazon</th>
                  <th className="py-3 font-semibold">MediaMarkt</th>
                </tr>
              </thead>
              <tbody className="divide-y text-[var(--muted-foreground)]">
                <tr>
                  <td className="py-2 pr-4 font-medium text-[var(--foreground)]">Preis</td>
                  <td className="py-2 pr-4">✅ Günstig</td>
                  <td className="py-2 pr-4">⚠️ Oft teurer</td>
                  <td className="py-2">⚠️ UVP</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-[var(--foreground)]">Erstattung</td>
                  <td className="py-2 pr-4 text-[var(--gold)] font-bold">✅ Jeder 10. Kauf</td>
                  <td className="py-2 pr-4">❌ Nein</td>
                  <td className="py-2">❌ Nein</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-[var(--foreground)]">Sofort-Download</td>
                  <td className="py-2 pr-4">✅ Per E-Mail</td>
                  <td className="py-2 pr-4">✅ Ja</td>
                  <td className="py-2">⚠️ Teils</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-[var(--foreground)]">Deutscher Anbieter</td>
                  <td className="py-2 pr-4">✅ München</td>
                  <td className="py-2 pr-4">❌ Luxembourg</td>
                  <td className="py-2">✅ Ingolstadt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="so-funktionierts" className="scroll-mt-8 border-t border-b px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold">
            So funktioniert <span className="text-[var(--gold)]">1of10</span>
          </h2>
          <p className="mb-12 text-center text-[var(--muted-foreground)]">
            Drei einfache Schritte — und bei jedem Kauf die Möglichkeit einer
            volle Kaufpreiserstattung.
          </p>

          {/* Steps */}
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--card)] border p-8 text-center">
              <div className="mb-2 text-5xl">🛒</div>
              <div className="mb-3 inline-block rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs font-bold text-[var(--primary)]">Schritt 1</div>
              <h3 className="mb-2 text-lg font-semibold">Produkt wählen</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Stöbere durch unser Sortiment — Software, Games, Guthaben und
                mehr. Alle Preise sind Endpreise, keine versteckten Kosten.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--card)] border p-8 text-center">
              <div className="mb-2 text-5xl">💳</div>
              <div className="mb-3 inline-block rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs font-bold text-[var(--primary)]">Schritt 2</div>
              <h3 className="mb-2 text-lg font-semibold">Sicher bezahlen</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Bezahle sicher über Stripe. Dein Produktkey wird sofort nach der
                Bezahlung per E-Mail zugestellt — kein Warten.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--card)] border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-8 text-center">
              <div className="mb-2 text-5xl">🎉</div>
              <div className="mb-3 inline-block rounded-full bg-[var(--gold)]/15 px-3 py-1 text-xs font-bold text-[var(--gold)]">Schritt 3</div>
              <h3 className="mb-2 text-lg font-semibold">Erstattung!</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Direkt nach dem Kauf erfährst du, ob dein Kauf erstattet wird.
                Wir erstatten freiwillig jeden 10. Kauf vollständig.
              </p>
            </div>
          </div>

          {/* The big question answered */}
          <div className="mt-16 rounded-xl border bg-[var(--card)] p-8 sm:p-10">
            <h3 className="mb-6 text-center text-2xl font-bold">
              Häufige Fragen
            </h3>
            <div className="space-y-6">
              <div>
                <p className="mb-1 font-semibold">
                  🎲 Wie funktioniert die Erstattung?
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Wir erstatten freiwillig jeden 10. Kauf in unserem Shop —
                  über alle Kunden hinweg. Die Auswahl ist zufällig und fair.
                  Ob dein Kauf erstattet wird, erfährst du sofort. Der
                  angezeigte Preis ist immer der tatsächliche Kaufpreis.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold">
                  🏆 Was passiert bei einer Erstattung?
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Du behältst dein Produkt — der Key bleibt gültig und aktiv.
                  Die Erstattung ist eine freiwillige Kulanzleistung und
                  erfolgt automatisch auf dein Zahlungsmittel.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold">
                  🔒 Ist das Glücksspiel?
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Nein. Du kaufst ein Produkt zum angegebenen Preis und
                  erhältst es garantiert. Die Erstattung ist eine einseitige,
                  freiwillige Kulanzleistung des Verkäufers — kein Einsatz,
                  kein Risiko, kein Gewinnspiel.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold">
                  📊 Kann ich das überprüfen?
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Ja. Auf unserer{" "}
                  <Link href="/transparenz" className="underline text-[var(--primary)]">
                    Transparenz-Seite
                  </Link>{" "}
                  siehst du live, wie viele Käufe erstattet wurden — echte
                  Zahlen, direkt aus unserem System.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold">
                  ⚡ Wie schnell bekomme ich mein Produkt?
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Sofort. Dein Produktkey wird unmittelbar nach der Bezahlung an
                  deine E-Mail-Adresse gesendet. Kein Warten, kein Versand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mehr entdecken — Blog/FAQ/Transparenz Links */}
      <section className="border-t px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold">Mehr erfahren</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/blog" className="rounded-xl border bg-[var(--card)] p-6 hover:border-[var(--primary)] transition">
              <div className="mb-2 text-2xl">📝</div>
              <h3 className="font-bold">Ratgeber & Vergleiche</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Norton vs. Bitdefender vs. McAfee — objective Vergleiche und Tipps.</p>
            </Link>
            <Link href="/faq" className="rounded-xl border bg-[var(--card)] p-6 hover:border-[var(--primary)] transition">
              <div className="mb-2 text-2xl">❓</div>
              <h3 className="font-bold">Häufige Fragen</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Wie funktioniert die Erstattung? Ist das seriös? Alle Antworten.</p>
            </Link>
            <Link href="/transparenz" className="rounded-xl border bg-[var(--card)] p-6 hover:border-[var(--primary)] transition">
              <div className="mb-2 text-2xl">📊</div>
              <h3 className="font-bold">Transparenz</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Echte Zahlen aus unserem System — live und nachvollziehbar.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup — Gregor (Growth): Lead Capture */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-md">
          <NewsletterSignup />
        </div>
      </section>

      {/* Footer — mit Trust-Signalen die einen echten Shop ausmachen */}
      <footer className="border-t px-6 py-8 text-center">
        {/* Zahlungsmethoden + Kontakt */}
        <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-center gap-4 text-xs text-[var(--muted-foreground)]">
          <span className="rounded border px-2 py-1">💳 Visa / Mastercard</span>
          <span className="rounded border px-2 py-1">🔒 Stripe Secure</span>
          <span className="rounded border px-2 py-1">📧 info@medialess.de</span>
          <span className="rounded border px-2 py-1">🇩🇪 München, Deutschland</span>
        </div>
        <nav aria-label="Rechtliche Informationen" className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--muted-foreground)]">
          <Link href="/impressum" className="hover:underline">Impressum</Link>
          <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
          <Link href="/agb" className="hover:underline">AGB</Link>
          <Link href="/widerruf" className="hover:underline">Widerrufsbelehrung</Link>
        </nav>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          © 2026 1of10 — Michael Hahnel, Einzelunternehmer — Alle Preise sind Endpreise.
        </p>
      </footer>
    </main>
  );
}
