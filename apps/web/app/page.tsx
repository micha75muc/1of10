import Link from "next/link";
import { WinnerTicker } from "./(shop)/products/winner-ticker";
import { LogoFull } from "./components/logo";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
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

      {/* How it works */}
      <section id="so-funktionierts" className="scroll-mt-8 border-t border-b px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold">
            So funktioniert <span className="text-[var(--gold)]">1of10</span>
          </h2>
          <p className="mb-12 text-center text-[var(--muted-foreground)]">
            Drei einfache Schritte — und bei jedem Kauf eine echte Chance auf
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

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--muted-foreground)]">
          <Link href="/impressum" className="hover:underline">Impressum</Link>
          <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
          <Link href="/agb" className="hover:underline">AGB</Link>
          <Link href="/widerruf" className="hover:underline">Widerrufsbelehrung</Link>
          <Link href="/admin" className="hover:underline">Admin</Link>
        </div>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          © 2026 1of10 — Alle Rechte vorbehalten.
        </p>
      </footer>
    </main>
  );
}
