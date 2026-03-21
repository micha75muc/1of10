import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über uns — 1of10",
  description:
    "Lerne 1of10 kennen: Ein AI-native Software-Shop aus Deutschland, betrieben von 22 KI-Agenten. Gründer Michael Hahnel über die Mission hinter Gamified Commerce.",
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
            Das ist 1of10. Ein Software-Lizenz-Shop, der jedem 10. Kunden den
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
        <h2 className="mb-4 text-2xl font-bold">Der Gründer</h2>
        <div className="rounded-xl border bg-[var(--card)] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-3xl">
              👤
            </div>
            <div>
              <h3 className="text-lg font-bold">Michael Hahnel</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Einzelunternehmer · Medialess · Deutschland
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Michael hat 1of10 als AI-native E-Commerce-Experiment gestartet:
                Ein Unternehmen, bei dem 22 KI-Agenten die täglichen
                Geschäftsprozesse steuern — vom Einkauf über Marketing bis zur
                Compliance-Prüfung. Michael trifft die strategischen
                Entscheidungen, die Agenten erledigen die Arbeit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Native */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold">22 KI-Agenten, 1 Mission</h2>
        <p className="mb-4 text-[var(--muted-foreground)]">
          1of10 wird von spezialisierten KI-Agenten betrieben, die jeweils eine
          Domäne abdecken:
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Nestor", role: "Beschaffung", emoji: "📦" },
            { name: "Elena", role: "Finanzen", emoji: "📊" },
            { name: "Denny", role: "Compliance", emoji: "⚖️" },
            { name: "Felix", role: "Frontend", emoji: "🎨" },
            { name: "Sven", role: "Security", emoji: "🔒" },
            { name: "Sophie", role: "SEO", emoji: "🔍" },
            { name: "Gregor", role: "Growth", emoji: "🚀" },
            { name: "Aria", role: "AI-Citation", emoji: "🔮" },
            { name: "Mira", role: "Simulation", emoji: "🧠" },
          ].map((agent) => (
            <div
              key={agent.name}
              className="flex items-center gap-3 rounded-lg border bg-[var(--card)] p-3"
            >
              <span className="text-xl">{agent.emoji}</span>
              <div>
                <p className="text-sm font-semibold">{agent.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {agent.role}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Alle KI-Entscheidungen unterliegen einem 4-stufigen Risikoklassen-System.
          Hochrisiko-Aktionen erfordern menschliche Genehmigung.{" "}
          <a href="/transparenz" className="text-[var(--primary)] underline">
            Mehr erfahren →
          </a>
        </p>
      </section>

      {/* Kontakt */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Kontakt</h2>
        <div className="rounded-xl border bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
          <p>Michael Hahnel · Medialess</p>
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
            founder: {
              "@type": "Person",
              name: "Michael Hahnel",
              jobTitle: "Gründer",
            },
            description:
              "AI-nativer Software-Lizenz-Shop mit Gamified Refund. Jeder 10. Kauf wird auf Kulanz erstattet.",
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
