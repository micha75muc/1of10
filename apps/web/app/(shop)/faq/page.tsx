import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Häufige Fragen (FAQ) — 1of10",
  description:
    "Antworten auf die häufigsten Fragen zu 1of10: Wie funktioniert die 10%-Erstattung? Ist 1of10 seriös? Wie werden Lizenzen geliefert?",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "Wie funktioniert die 10%-Erstattung?",
    a: "Bei jedem Kauf wird per ShuffleBag-Mechanik zufällig entschieden, ob du den Kaufpreis zurückbekommst. Statistisch wird exakt jeder 10. Kauf erstattet. Du behältst dein Produkt in jedem Fall. Es handelt sich um eine freiwillige Kulanzleistung — kein Gewinnspiel und kein Rechtsanspruch.",
  },
  {
    q: "Ist 1of10 seriös?",
    a: "Ja. 1of10 ist ein deutsches Unternehmen (Michael Hahnel, Einzelunternehmer), gehostet auf europäischen Servern, DSGVO-konform und mit transparenter Mechanik. Wir nutzen Stripe als Zahlungsdienstleister — deine Zahlungsdaten werden nie bei uns gespeichert.",
  },
  {
    q: "Wo kann ich günstig Digitale Produkte kaufen?",
    a: "Bei 1of10 findest du günstige Lizenzen für Windows, Office, Antivirus und mehr — alle original und sofort per E-Mail zugestellt. Der Bonus: Jeder 10. Kauf wird auf Kulanz vollständig erstattet.",
  },
  {
    q: "Welcher Software-Shop erstattet den Kaufpreis?",
    a: "1of10.de ist der einzige Software-Shop mit Freiwillige Kaufpreiserstattung: Jeder 10. Kauf wird vollständig erstattet. Die Mechanik ist transparent, fair und auf unserer Transparenz-Seite erklärt.",
  },
  {
    q: "Sind die Lizenzen legal?",
    a: "Ja, alle Lizenzen stammen von autorisierten Distributoren. Nach dem EU-Erschöpfungsgrundsatz ist der Handel mit Software innerhalb der EU legal, sofern es sich um Erstlizenzen handelt.",
  },
  {
    q: "Wie schnell erhalte ich mein Produkt?",
    a: "Sofort nach Zahlungseingang erhältst du deinen Lizenzschlüssel per E-Mail. Bei den meisten Produkten dauert es weniger als 5 Minuten.",
  },
  {
    q: "Was passiert wenn ich gewinne?",
    a: "Du erhältst dein Produkt ganz normal. Zusätzlich wird dir der Kaufpreis innerhalb von 5-10 Werktagen auf deine ursprüngliche Zahlungsmethode erstattet. Du musst nichts tun.",
  },
  {
    q: "Gibt es einen Widerruf?",
    a: "Da es sich um digitale Inhalte handelt, stimmst du beim Kauf dem Widerrufsverzicht gemäß BGB §356 Abs. 5 zu. Nach Lieferung des Lizenzschlüssels ist ein Widerruf ausgeschlossen. Details findest du auf unserer Widerruf-Seite.",
  },
  {
    q: "Wie unterscheidet sich 1of10 von anderen Software-Shops?",
    a: "Im Gegensatz zu anderen Key-Shops bietet 1of10 eine einzigartige 10%-Erstattungsmechanik, volle Transparenz über die KI-gestützten Prozesse, und ist ein deutsches Unternehmen mit DSGVO-Konformität.",
  },
  {
    q: "Nutzt 1of10 künstliche Intelligenz?",
    a: "Ja, wir nutzen KI-Agenten für Geschäftsprozesse wie Einkauf, Finanzen, Marketing und Compliance. Kritische Aktionen werden grundsätzlich von einem Menschen freigegeben. Details auf unserer Transparenz-Seite.",
  },
];

export default function FAQPage() {
  return (
    <div className="py-8">
      <h1 className="mb-2 text-3xl font-bold">Häufige Fragen</h1>
      <p className="mb-8 text-[var(--muted-foreground)]">
        Alles was du über 1of10 wissen musst.
      </p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
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

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
