import { prisma } from "@repo/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparenz — So funktioniert die Erstattung",
  description:
    "Wie 1of10 die Kaufpreiserstattung umsetzt: ShuffleBag-Verfahren mit kryptografischer Hash-Verifikation. Provably fair, EU AI Act konform.",
  alternates: { canonical: "/transparenz" },
  openGraph: {
    title: "Transparenz — So funktioniert die 1of10-Erstattung",
    description:
      "Provably-fair Erstattungs-Mechanik mit SHA-256 Hash-Verifikation.",
  },
};

export const dynamic = "force-dynamic";

export default async function TransparenzPage() {
  const [activeBag, pastBags] = await Promise.all([
    // Provably-fair: aktiver Beutel mit SHA-256 Hash öffentlich.
    // slots werden NICHT angezeigt (das wäre der Witz weg) — nur
    // Hash + Größe + Erstellungsdatum. currentIndex wird bewusst
    // weggelassen, weil er implizit das aktuelle Verkaufsvolumen
    // im laufenden Beutel leakt.
    prisma.shuffleBag.findFirst({
      where: { isActive: true },
      select: { id: true, slotsHash: true, createdAt: true, slots: true },
    }),
    prisma.shuffleBag.findMany({
      where: { isActive: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, slotsHash: true, slots: true, createdAt: true },
    }),
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wie funktioniert die Erstattung bei 1of10?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Wir erstatten exakt jeden 10. Kauf in unserem Shop — über alle Kunden hinweg. Die Auswahl ist zufällig und fair. Ob dein Kauf erstattet wird, erfährst du sofort nach dem Kauf.",
        },
      },
      {
        "@type": "Question",
        name: "Wird jeder 10. Kauf eines einzelnen Kunden erstattet?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nein, die Erstattung bezieht sich auf jeden 10. Kauf insgesamt, nicht auf jeden 10. Kauf eines einzelnen Kunden. Je öfter du kaufst, desto höher die Wahrscheinlichkeit, dass einer deiner Käufe dabei ist.",
        },
      },
      {
        "@type": "Question",
        name: "Behalte ich mein Produkt bei einer Erstattung?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, dein Produkt behältst du in jedem Fall — auch wenn dein Kauf erstattet wird. Die Erstattung ist eine freiwillige Kulanzleistung.",
        },
      },
      {
        "@type": "Question",
        name: "Ist die Erstattung garantiert?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Die Erstattung ist eine freiwillige Kulanzleistung des Anbieters. Statistisch wird jeder 10. Kauf erstattet. Es besteht kein Rechtsanspruch auf Erstattung. Der angezeigte Preis ist immer der verbindliche Kaufpreis.",
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <h1 className="mb-3 text-3xl font-bold">Transparenz</h1>
      <p className="mb-8 text-[var(--muted-foreground)]">
        So funktioniert die Kaufpreiserstattung bei 1of10 — kryptografisch
        nachvollziehbar und unabhängig prüfbar.
      </p>

      {/* How it works — ShuffleBag */}
      <div className="mb-10 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-xl font-semibold">
          So funktioniert die Erstattung
        </h2>
        <div className="space-y-4 text-sm text-[var(--muted-foreground)]">
          <p>
            Unser System nutzt ein <strong className="text-[var(--foreground)]">ShuffleBag-Verfahren</strong> — 
            ein bewährtes Fairness-Prinzip aus der Spieleentwicklung, adaptiert
            für E-Commerce.
          </p>
          <p>Stell dir einen Beutel mit Murmeln vor:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong className="text-[var(--foreground)]">Beutel füllen:</strong> Bei
              Start kommt ein Satz von 7–13 Murmeln in den Beutel — genau eine
              davon ist gold (= Erstattung), der Rest ist normal. Die
              Beutelgröße variiert zufällig (Durchschnitt: 10).
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Mischen:</strong> Die
              Reihenfolge wird kryptografisch sicher gemischt (Fisher-Yates
              Algorithmus mit <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">crypto.randomInt</code>). 
              Niemand — auch wir nicht — kann vorhersagen, an welcher Position die
              goldene Murmel liegt.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Ziehen:</strong> Mit
              jedem Kauf wird die nächste Murmel gezogen. Ist sie gold? →
              Vollständige Kaufpreiserstattung. Normal? → Normaler Kauf.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Neuer Beutel:</strong> Sobald
              alle Murmeln gezogen sind, wird automatisch ein neuer Beutel
              erstellt. Die variable Größe (7–13) verhindert, dass jemand den
              Erstattungs-Slot berechnen kann.
            </li>
          </ol>
          <div className="mt-3 rounded-lg bg-[var(--muted)]/50 p-4">
            <p className="text-xs font-medium text-[var(--foreground)]">
              🔐 Provably Fair
            </p>
            <p className="mt-1 text-xs">
              Bei Erstellung jedes Beutels wird ein SHA-256 Hash gespeichert.
              Damit lässt sich nachträglich prüfen, dass die Reihenfolge nicht
              manipuliert wurde — ähnlich wie bei Blockchain-basierten
              Fairness-Beweisen.
            </p>

            {activeBag && activeBag.slotsHash && (
              <div className="mt-4 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gold)]">
                  Aktueller Beutel — live
                </p>
                <dl className="mt-2 grid gap-1 text-[11px] sm:grid-cols-[140px_1fr]">
                  <dt className="text-[var(--muted-foreground)]">Beutel-ID</dt>
                  <dd className="font-mono break-all">{activeBag.id}</dd>
                  <dt className="text-[var(--muted-foreground)]">Beutelgröße</dt>
                  <dd>{activeBag.slots.length} Lose</dd>
                  <dt className="text-[var(--muted-foreground)]">SHA-256 (slots)</dt>
                  <dd className="font-mono break-all text-[10px]">{activeBag.slotsHash}</dd>
                  <dt className="text-[var(--muted-foreground)]">Erstellt</dt>
                  <dd>
                    {activeBag.createdAt.toLocaleDateString("de-DE", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </dd>
                </dl>
                <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
                  Die Reihenfolge der Lose ist nicht öffentlich — sonst wäre
                  der Erstattungs-Slot vorhersehbar. Sobald der Beutel leer
                  ist, wird er unten in der „Verifizierbare Beutel"-Liste mit
                  voller Reihenfolge offengelegt, und du kannst den Hash
                  selbst nachrechnen.
                </p>
              </div>
            )}

            {pastBags.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Verifizierbare Beutel (abgeschlossen)
                </p>
                <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                  Reihenfolge offengelegt. Verifikation:{" "}
                  <code className="rounded bg-[var(--muted)] px-1 py-0.5">sha256(JSON.stringify(slots))</code>{" "}
                  muss dem angezeigten Hash entsprechen.
                </p>
                <div className="mt-2 space-y-2">
                  {pastBags.map((bag) => (
                    <details key={bag.id} className="rounded-md border bg-[var(--background)]/50 p-2 text-[10px]">
                      <summary className="cursor-pointer font-mono">
                        {bag.id.slice(0, 8)}… ·{" "}
                        {bag.createdAt.toLocaleDateString("de-DE")} ·{" "}
                        {bag.slots.length} Lose
                      </summary>
                      <dl className="mt-2 space-y-1">
                        <div>
                          <dt className="text-[var(--muted-foreground)]">Hash</dt>
                          <dd className="font-mono break-all">{bag.slotsHash}</dd>
                        </div>
                        <div>
                          <dt className="text-[var(--muted-foreground)]">Slots (1 = Erstattung)</dt>
                          <dd className="font-mono break-all">
                            [{bag.slots.join(", ")}]
                          </dd>
                        </div>
                      </dl>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Not a lottery */}
      <div className="mb-10 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Keine Lotterie, kein Gewinnspiel
        </h2>
        <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
          <p>
            Wir möchten das klar sagen:{" "}
            <strong className="text-[var(--foreground)]">
              1of10 ist kein Gewinnspiel und keine Lotterie.
            </strong>
          </p>
          <p>
            Die Erstattung ist eine{" "}
            <strong className="text-[var(--foreground)]">
              freiwillige Kulanzleistung
            </strong>{" "}
            von uns als Händler. Es besteht kein Rechtsanspruch auf Erstattung.
            Der angezeigte Preis ist immer der verbindliche Kaufpreis — du
            zahlst nie mehr als angezeigt.
          </p>
          <p>
            Du kaufst eine Software zum regulären Preis. Wenn dein Kauf
            der Erstattungs-Slot ist, erstatten wir dir den kompletten
            Kaufpreis — aus Kulanz. Dein Produkt behältst du in jedem Fall.
          </p>
          <p>
            <strong className="text-[var(--foreground)]">Wichtig:</strong> Die
            Erstattung bezieht sich auf jeden ca. 10. Kauf insgesamt, nicht auf
            jeden 10. Kauf eines einzelnen Kunden.
          </p>
        </div>
      </div>

      {/* AI Transparency — EU AI Act (customer-facing, generic disclosure) */}
      <div className="mb-10 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Einsatz von KI
        </h2>
        <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
          <p>
            1of10 nutzt KI nur für interne Geschäftsprozesse — etwa Einkauf,
            Marketing-Entwürfe, Buchhaltungs-Auswertungen und Compliance-Checks.
          </p>
          <p className="text-[var(--foreground)] font-medium">
            Was das für dich als Kunde bedeutet:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--foreground)]">Keine KI</strong>{" "}
              entscheidet, ob dein Kauf erstattet wird — das macht ausschließlich
              unser deterministisches ShuffleBag-Verfahren (siehe oben).
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Keine KI</strong>{" "}
              setzt Preise individuell für dich. Der Preis ist für alle gleich.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Keine KI</strong>{" "}
              entscheidet eigenständig über Bestellungen, Stornos oder
              Auszahlungen — sicherheitskritische Aktionen werden grundsätzlich
              von einem Menschen freigegeben.
            </li>
          </ul>
          <p className="text-xs">
            Diese Offenlegung erfolgt im Sinne des EU&nbsp;AI&nbsp;Act
            (Verordnung&nbsp;2024/1689). Hast du Fragen dazu?{" "}
            <a
              href="mailto:info@medialess.de"
              className="text-[var(--gold)] underline-offset-4 hover:underline"
            >
              info@medialess.de
            </a>
          </p>
        </div>
      </div>

      {/* Bottom note */}
      <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        Sobald ein Beutel abgeschlossen ist, wird seine vollständige
        Reihenfolge oben offengelegt — der Hash lässt sich unabhängig
        nachrechnen.
      </p>
    </div>
  );
}
