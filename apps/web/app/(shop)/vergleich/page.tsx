import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Software-Shops im Vergleich — 1of10 vs. andere Anbieter",
  description:
    "Vergleich von 1of10 mit anderen Software-Shops: Preise, Sicherheit, Erstattung, Lieferung und Transparenz im direkten Vergleich.",
  alternates: { canonical: "/vergleich" },
};

const features = [
  { feature: "Kaufpreiserstattung", us: "Jeder 10. Kauf", others: "Keine" },
  { feature: "Original-Lizenzen", us: "✅ Immer", others: "Variiert" },
  { feature: "Sofort-Download per E-Mail", us: "✅", others: "✅ Meistens" },
  { feature: "Transparente Preise", us: "✅ Endpreis angezeigt", others: "Oft versteckte Gebühren" },
  { feature: "Zahlung via Stripe", us: "✅ PCI-DSS konform", others: "Variiert" },
  { feature: "DSGVO-konform", us: "✅ Deutsches Unternehmen", others: "Oft nicht-EU" },
  { feature: "KI-gesteuerte Prozesse", us: "✅ 21 Agenten", others: "Nein" },
  { feature: "EU AI Act Transparenz", us: "✅ Offengelegt", others: "N/A" },
  { feature: "Risikoklassen-System", us: "✅ 4 Stufen", others: "Nein" },
  { feature: "Widerrufsverzicht dokumentiert", us: "✅ BGB §356 Abs. 5", others: "Oft unklar" },
];

export default function VergleichPage() {
  return (
    <div className="py-8">
      <h1 className="mb-2 text-3xl font-bold">Software-Shops im Vergleich</h1>
      <p className="mb-8 text-[var(--muted-foreground)]">
        Was unterscheidet 1of10 von anderen Software-Shops?
      </p>

      {/* Vergleich: Tabelle (md+) und Karten (mobile) — C8 */}
      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {features.map((row, i) => (
          <div
            key={i}
            className="rounded-xl border bg-[var(--card)] p-4"
          >
            <p className="mb-2 text-sm font-semibold">{row.feature}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">1of10</p>
                <p className="text-[var(--primary)]">{row.us}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Andere</p>
                <p className="text-[var(--muted-foreground)]">{row.others}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Tabelle */}
      <div className="hidden md:block overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-[var(--secondary)]">
              <th className="px-4 py-3 text-left font-semibold">Feature</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary)]">
                1of10
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--muted-foreground)]">
                Typische Key-Shops
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((row, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-[var(--card)]" : ""}
              >
                <td className="px-4 py-3 font-medium">{row.feature}</td>
                <td className="px-4 py-3 text-[var(--primary)]">{row.us}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {row.others}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="mt-8 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-6 text-center">
        <p className="mb-3 text-lg font-bold">
          Überzeuge dich selbst
        </p>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          Jeder 10. Kauf wird auf Kulanz vollständig erstattet.
        </p>
        <a
          href="/products"
          className="inline-block rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)]"
        >
          Zum Shop →
        </a>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Häufige Vergleichs-Fragen</h2>
        <div className="space-y-4">
          {[
            {
              q: "Ist 1of10 günstiger als andere Shops?",
              a: "Unsere Preise sind vergleichbar mit anderen Key-Shops. Der Unterschied: Bei 1of10 wird jeder 10. Kauf vollständig erstattet — das senkt den effektiven Preis für alle Kunden um durchschnittlich 10%.",
            },
            {
              q: "Warum sollte ich bei 1of10 kaufen statt direkt beim Hersteller?",
              a: "Hersteller-Shops bieten keine Erstattungsmechanik. Bei 1of10 sparst du gegenüber dem Listenpreis UND hast die Möglichkeit einer vollständigen Erstattung. Alle Lizenzen sind original und autorisiert.",
            },
            {
              q: "Ist 1of10 seriöser als günstige Key-Shops?",
              a: "Als deutsches Unternehmen unterliegt 1of10 dem deutschen Verbraucherrecht, der DSGVO und dem EU AI Act. Unsere Prozesse sind transparent, unsere KI-Systeme kontrolliert und unsere Zahlungen laufen über Stripe.",
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="group rounded-lg border bg-[var(--card)] p-4"
            >
              <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                {faq.q}
                <span className="ml-2 text-[var(--muted-foreground)] transition group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Wie unterscheidet sich 1of10 von anderen Software-Shops?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "1of10 bietet als einziger Software-Shop eine 10%-Erstattungsmechanik (Freiwillige Kaufpreiserstattung). Jeder 10. Kauf wird vollständig erstattet. Zusätzlich ist 1of10 ein deutsches Unternehmen mit DSGVO-Konformität und EU AI Act Transparenz.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
