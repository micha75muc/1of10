import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns — 1of10",
  description:
    "Lerne 1of10 kennen: Ein AI-native Software-Shop aus Deutschland, betrieben mit Hilfe spezialisierter KI-Agenten. Die Mission hinter gamifiziertem Commerce.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="py-8">
      <h1 className="mb-2 text-3xl font-bold">Über 1of10</h1>
      <p className="mb-8 text-lg text-[var(--muted-foreground)]">
        Ein Software-Shop, bei dem jeder 10. Kauf kostenlos ist — betrieben von
        KI, kontrolliert von einem Menschen.
      </p>

      {/* Gründer-Story */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold">Die Idee</h2>
        <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed">
          <p>
            Was wäre, wenn Online-Shopping sich nicht nur wie eine Transaktion
            anfühlt, sondern wie ein Erlebnis? Was wäre, wenn jeder Kauf die
            Chance birgt, komplett kostenlos zu sein?
          </p>
          <p>
            Das ist 1of10. Ein Software-Shop, der jedem 10. Kunden den
            vollen Kaufpreis erstattet — nicht als Marketing-Trick, sondern als
            faires System mit transparenter Mechanik.
          </p>
          <p>
            Die ShuffleBag-Mechanik stellt sicher, dass die Erstattung statistisch
            exakt bei jedem 10. Kauf erfolgt. Kein Zufall, kein Glücksspiel —
            sondern ein deterministischer Algorithmus, den wir auf unserer{" "}
            <a href="/transparenz" className="text-[var(--primary)] underline">
              Transparenz-Seite
            </a>{" "}
            offenlegen.
          </p>
        </div>
      </section>

      {/* Gründer */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold">Wer hinter 1of10 steht</h2>
        <div className="rounded-xl border bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">
            1of10 wird als deutsches Einzelunternehmen unter der Marke
            <strong className="text-[var(--foreground)]"> Medialess</strong> aus
            München betrieben. Vollständige Anbieterangaben gemäß §5 DDG
            findest du im{" "}
            <a href="/impressum" className="text-[var(--primary)] underline">
              Impressum
            </a>
            .
          </p>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            1of10 ist ein AI-native E-Commerce-Experiment: Ein Unternehmen,
            bei dem KI-Agenten die täglichen Geschäftsprozesse steuern — vom
            Einkauf über Marketing bis zur Compliance-Prüfung. Strategische
            Entscheidungen trifft der Mensch, die Agenten erledigen die
            Arbeit.
          </p>
        </div>
      </section>

      {/* AI-Native */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold">KI-betrieben, menschlich kontrolliert</h2>
        <p className="mb-4 text-[var(--muted-foreground)]">
          1of10 wird mit Hilfe spezialisierter KI-Agenten betrieben, die in
          klar abgegrenzten Bereichen arbeiten:
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Einkauf & Lizenz-Beschaffung",
            "Finanzen & Buchhaltung",
            "Compliance (DSGVO, EU AI Act)",
            "Frontend & UX",
            "Sicherheit & Datenschutz",
            "SEO & Auffindbarkeit",
            "Wachstum & Marketing",
            "Markt- und Trendanalyse",
            "Simulation & A/B-Tests",
          ].map((domain) => (
            <div
              key={domain}
              className="rounded-lg border bg-[var(--card)] p-3"
            >
              <p className="text-sm text-[var(--foreground)]">{domain}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Wichtig: Keine KI entscheidet eigenständig über deine Erstattung,
          deinen Preis oder kritische Bestellungen — sicherheitsrelevante
          Aktionen werden grundsätzlich von einem Menschen freigegeben.{" "}
          <a href="/transparenz" className="text-[var(--primary)] underline">
            Mehr erfahren →
          </a>
        </p>
      </section>

      {/* Kontakt */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Kontakt</h2>
        <div className="rounded-xl border bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
          <p>1of10 · Medialess</p>
          <p>E-Mail: info@medialess.de</p>
          <p className="mt-2">
            <a href="/impressum" className="text-[var(--primary)] underline">
              Vollständiges Impressum →
            </a>
          </p>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "1of10",
            url: "https://1of10.de",
            description:
              "AI-nativer Software-Shop mit Freiwillige Kaufpreiserstattung. Jeder 10. Kauf wird auf Kulanz erstattet.",
            contactPoint: {
              "@type": "ContactPoint",
              email: "info@medialess.de",
              contactType: "customer service",
              availableLanguage: "German",
            },
          }),
        }}
      />
    </div>
  );
}
