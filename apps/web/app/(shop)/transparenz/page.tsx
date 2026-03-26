import { prisma } from "@repo/db";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparenz — Unsere Erstattungen in Echtzeit",
  description:
    "Live-Statistik der 1of10-Kaufpreiserstattungen. Echte Zahlen, direkt aus unserem System. Jeder 10. Kauf wird erstattet — hier ist der Beweis.",
  alternates: { canonical: "/transparenz" },
  openGraph: {
    title: "Transparenz — 1of10 Erstattungen in Echtzeit",
    description:
      "Echte Zahlen unserer Erstattungen. Nicht ausgedacht, nicht geschönt.",
  },
};

export const dynamic = "force-dynamic";

export default async function TransparenzPage() {
  const [totalOrders, totalWinners, totalRefundAmount, recentWinners, lastWinOrder] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { isWinner: true } }),
      prisma.order.aggregate({
        where: { isWinner: true, refundStatus: "COMPLETED" },
        _sum: { amountTotal: true },
      }),
      prisma.order.findMany({
        where: { isWinner: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { product: true },
      }),
      prisma.order.findFirst({
        where: { isWinner: true },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

  // Count orders since last winner (correct math, not assuming bag size 10)
  const sinceLastWin = lastWinOrder
    ? await prisma.order.count({ where: { createdAt: { gt: lastWinOrder.createdAt } } })
    : totalOrders;

  const refundRate =
    totalOrders > 0 ? ((totalWinners / totalOrders) * 100).toFixed(1) : "—";
  const totalRefunded = Number(totalRefundAmount._sum.amountTotal ?? 0);

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
        Echte Zahlen, direkt aus unserem System — nicht ausgedacht, nicht
        geschönt. Diese Seite aktualisiert sich mit jedem Kauf automatisch.
      </p>

      {/* Stats Grid — Bea: nur anzeigen wenn Käufe existieren, sonst "Coming Soon" */}
      {totalOrders > 0 ? (
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Gesamte Käufe" value={totalOrders.toString()} />
          <StatCard label="Davon erstattet" value={totalWinners.toString()} />
          <StatCard label="Erstattungsquote" value={`${refundRate} %`} highlight />
          <StatCard
            label="Erstattet (Gesamt)"
            value={`${totalRefunded.toFixed(2).replace(".", ",")} €`}
          />
        </div>
      ) : (
        <div className="mb-10 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-8 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-xl font-bold text-[var(--gold)]">Wir sind fast live!</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Sobald die ersten Käufe eingehen, siehst du hier in Echtzeit wie viele Käufe erstattet wurden.
            Jeder 10. Kauf wird garantiert erstattet — transparent und nachvollziehbar.
          </p>
        </div>
      )}

      {/* Bea (Gamification): Next refund teaser */}
      {totalOrders > 0 && (
        <div className="mb-10 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-6 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">Seit der letzten Erstattung:</p>
          <p className="text-4xl font-extrabold text-[var(--gold)]">{sinceLastWin} Käufe</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Statistisch kommt die nächste Erstattung bald!</p>
        </div>
      )}

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

      {/* AI Transparency — EU AI Act */}
      <div className="mb-10 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-xl font-semibold">
          KI-gesteuerte Prozesse — EU AI Act Transparenz
        </h2>
        <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
          <p>
            1of10 setzt KI-Agenten ein, um Geschäftsprozesse effizient und
            transparent zu steuern. Gemäß dem EU AI Act informieren wir dich
            offen darüber, wo und wie KI bei uns zum Einsatz kommt.
          </p>
          <p className="font-medium text-[var(--foreground)]">
            Unsere KI-Agenten und ihre Aufgaben:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                name: "Nestor",
                role: "Einkauf",
                desc: "Vergleicht Distributoren-Preise und erstellt Preisvorschläge",
              },
              {
                name: "Elena",
                role: "Finanzen",
                desc: "Analysiert Bestellungen, Gebühren und erstellt Berichte",
              },
              {
                name: "Inge",
                role: "Marketing",
                desc: "Erstellt Content-Entwürfe und bereitet Erstattungskunde-Kommunikation vor",
              },
              {
                name: "Martin",
                role: "IT & Support",
                desc: "Beantwortet Support-Anfragen auf Basis unserer Wissensdatenbank",
              },
              {
                name: "Denny",
                role: "Compliance",
                desc: "Prüft Prozesse auf Rechtskonformität (DSGVO, BGB, EU AI Act)",
              },
            ].map((agent) => (
              <div
                key={agent.name}
                className="rounded-lg border p-3"
              >
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  {agent.name}{" "}
                  <span className="font-normal text-[var(--muted-foreground)]">
                    — {agent.role}
                  </span>
                </p>
                <p className="mt-1 text-xs">{agent.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs">
            <strong className="text-[var(--foreground)]">Wichtig:</strong> Keine
            KI trifft eigenständig Entscheidungen, die dich als Kunden direkt
            betreffen. Die finale Entscheidung über Erstattungen trifft unser
            technisches System (ShuffleBag) — deterministisch und ohne KI-Einfluss.
          </p>
        </div>
      </div>

      {/* Risk Classes */}
      <div className="mb-10 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Risikoklassen: Wie wir KI kontrollieren
        </h2>
        <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
          <p>
            Jede Aktion unserer KI-Agenten wird durch ein
            4-stufiges Risikoklassen-System kontrolliert. Je höher das Risiko,
            desto strenger die Kontrolle.
          </p>
          <div className="space-y-2">
            {[
              {
                level: "1",
                label: "Nur Lesen",
                color: "text-green-500",
                desc: "Datenabfragen — keine Genehmigung nötig",
              },
              {
                level: "2",
                label: "Entwurf",
                color: "text-blue-500",
                desc: "Vorschläge erstellen — wird geloggt, keine Blockierung",
              },
              {
                level: "3",
                label: "Schreibzugriff",
                color: "text-yellow-500",
                desc: "Änderungen an Daten — wird in der Datenbank protokolliert",
              },
              {
                level: "4",
                label: "Hochrisiko",
                color: "text-red-500",
                desc: "Kritische Aktionen — blockiert bis ein Mensch genehmigt",
              },
            ].map((rc) => (
              <div
                key={rc.level}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <span
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rc.color} bg-current/10`}
                >
                  {rc.level}
                </span>
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {rc.label}
                  </p>
                  <p className="text-xs">{rc.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs">
            Alle Aktionen der Stufe 4 — wie der Einkauf neuer Lizenzschlüssel
            oder die Veröffentlichung von Erstattungskunden — landen in einer
            Genehmigungswarteschlange und werden erst nach menschlicher
            Freigabe ausgeführt.
          </p>
        </div>
      </div>

      {/* Recent refunds */}
      {recentWinners.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Letzte Erstattungen
          </h2>
          <div className="space-y-2">
            {recentWinners.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border bg-[var(--card)] px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎉</span>
                  <div>
                    <p className="font-medium">{order.product.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {order.createdAt.toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[var(--gold)]">
                  {Number(order.amountTotal).toFixed(2).replace(".", ",")} € erstattet
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalOrders === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-[var(--muted-foreground)]">
            Noch keine Käufe — die Statistik füllt sich mit dem ersten
            Kauf automatisch.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
          >
            Zum Shop
          </Link>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        Diese Daten werden in Echtzeit aus unserer Datenbank geladen und sind
        nicht manuell editierbar.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "border-[var(--gold)]/30 bg-[var(--gold)]/5"
          : "bg-[var(--card)]"
      }`}
    >
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold ${
          highlight ? "text-[var(--gold)]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
