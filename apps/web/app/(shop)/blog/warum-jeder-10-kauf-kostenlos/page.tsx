import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Warum wir jedem 10. Kunden den Kaufpreis erstatten — Software günstig kaufen",
  description:
    "Welcher Shop gibt freiwillig Geld zurück? 1of10 erstattet jeden 10. Kauf — komplett. Erfahre, wie das funktioniert und warum es für alle ein guter Deal ist.",
  alternates: { canonical: "/blog/warum-jeder-10-kauf-kostenlos" },
  openGraph: {
    title: "Warum wir jedem 10. Kunden den Kaufpreis erstatten",
    description:
      "Digitale Produkte günstig kaufen — und jeder 10. Kauf ist komplett kostenlos. So funktioniert 1of10.",
  },
};

export default function BlogPost() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "Warum wir jedem 10. Kunden den Kaufpreis erstatten",
    description:
      "Welcher Shop gibt freiwillig Geld zurück? 1of10 erstattet jeden 10. Kauf — komplett.",
    datePublished: "2026-03-21",
    author: {
      "@type": "Person",
      name: "Michael Hahnel",
    },
    publisher: {
      "@type": "Organization",
      name: "1of10",
      url: "https://1of10.de",
    },
  };

  return (
    <article className="mx-auto max-w-2xl py-8">
      <script
        type="application/ld+json"
        // Escape `</` to prevent any future dynamic JSON-LD payload from
        // breaking out of the <script> block (defense in depth).
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-[var(--muted-foreground)]">
        <Link href="/blog" className="hover:text-[var(--primary)] transition">
          ← Zurück zum Ratgeber
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-[var(--primary)]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
            1of10 Inside
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            21. März 2026
          </span>
        </div>
        <h1 className="text-3xl font-bold leading-tight">
          Warum wir jedem 10.&nbsp;Kunden den Kaufpreis erstatten
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Welcher Shop gibt freiwillig Geld zurück? Wir. Und das hat einen
          verdammt guten Grund.
        </p>
      </div>

      {/* Article body */}
      <div className="prose-custom space-y-6 text-[var(--muted-foreground)]">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Mal ehrlich: Software kaufen ist langweilig
          </h2>
          <p>
            Du brauchst eine Lizenz. Du googelst. Du vergleichst drei Shops. Die
            Preise sind überall gleich. Du kaufst dort, wo der „Jetzt kaufen"-Button am
            größten ist. Und danach? Danach passiert … nichts. Genau das wollten
            wir ändern.
          </p>
          <p>
            Bei 1of10 kaufst du Software zum ganz normalen
            Marktpreis — kein Aufschlag, keine versteckten Kosten. Aber mit einem
            Unterschied, der alles verändert:{" "}
            <strong className="text-[var(--foreground)]">
              Jeder 10. Kauf wird komplett erstattet.
            </strong>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Wie das funktioniert (ohne Kleingedrucktes)
          </h2>
          <p>
            Unser System arbeitet mit einem sogenannten{" "}
            <strong className="text-[var(--foreground)]">ShuffleBag</strong> —
            stell dir einen Beutel mit 10 Murmeln vor. Eine davon ist gold. Mit
            jedem Kauf wird eine Murmel gezogen. Ziehst du die goldene, bekommst
            du den kompletten Kaufpreis zurück. Dein Produkt behältst du
            selbstverständlich.
          </p>
          <p>
            Die Beutelgröße variiert leicht (7–13 statt immer genau 10), damit
            niemand den Erstattungs-Slot vorhersagen kann. Die Mischung ist
            kryptografisch sicher — weder wir noch sonst jemand weiß vorher, bei
            welchem Kauf die Erstattung fällt.
          </p>
          <p>
            Im Durchschnitt wird also jeder 10. Kauf erstattet. Nicht jeder 10.
            Kauf <em>pro Kunde</em>, sondern jeder 10. Kauf <em>insgesamt</em>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            „Moment — ist das legal?"
          </h2>
          <p>
            Ja. Und zwar aus einem einfachen Grund: Es ist kein Gewinnspiel. Du
            zahlst den regulären Preis für eine echte Software. Die
            Erstattung ist eine{" "}
            <strong className="text-[var(--foreground)]">
              freiwillige Kulanzleistung
            </strong>{" "}
            — eine Kaufpreiserstattung, kein Gewinn. Es gibt keinen „Einsatz",
            kein Los und keinen Rechtsanspruch auf die Erstattung.
          </p>
          <p>
            Du bekommst in jedem Fall ein vollwertiges Produkt zum Marktpreis.
            Die Chance auf Erstattung ist ein Bonus — nicht die Grundlage des
            Kaufs.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Warum das für ALLE funktioniert
          </h2>
          <p>
            „Klingt nach einem Verlustgeschäft" — hören wir oft. Ist es nicht.
            So funktioniert die Rechnung:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--foreground)]">Für dich als Kunde:</strong>{" "}
              Du kaufst Software zum normalen Preis. Kein Risiko, kein Haken. Und
              bei jedem Kauf die reale Chance, den Kaufpreis zurückzubekommen.
              Das macht den Kauf aufregender als bei jedem anderen Shop.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Für uns als Shop:</strong>{" "}
              Wir kalkulieren die Erstattungen in unsere Marge ein. Statt Geld
              in teure Werbung zu stecken, geben wir es direkt an unsere
              Kunden zurück. Das baut Vertrauen auf, generiert Mundpropaganda
              und macht unseren Shop einzigartig.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Für die Community:
              </strong>{" "}
              Jeder Kauf, der erstattet wird, ist eine echte Geschichte. Echte
              Menschen, echte Erstattungen — live auf unserer{" "}
              <Link
                href="/transparenz"
                className="font-medium text-[var(--primary)] hover:underline"
              >
                Transparenz-Seite
              </Link>{" "}
              nachvollziehbar.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Transparenz ist kein Buzzword bei uns
          </h2>
          <p>
            Wir zeigen dir{" "}
            <Link
              href="/transparenz"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              in Echtzeit
            </Link>
            , wie viele Käufe es gab, wie viele erstattet wurden und wie viel
            Geld wir zurückgegeben haben. Diese Zahlen werden live aus unserer
            Datenbank geladen — nicht aus einer Marketing-Powerpoint.
          </p>
          <p>
            Außerdem setzen wir KI-Agenten ein, um unsere internen Prozesse zu
            steuern — vom Einkauf bis zur Compliance-Prüfung. Kritische
            Entscheidungen werden grundsätzlich von einem Menschen freigegeben.
            Mehr dazu auf unserer{" "}
            <Link
              href="/transparenz"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Transparenz-Seite
            </Link>
            .
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-xl border bg-[var(--card)] p-6 text-center">
          <p className="text-lg font-bold text-[var(--foreground)]">
            Bereit für deinen ersten Kauf?
          </p>
          <p className="mt-2 text-sm">
            Software zum normalen Preis — mit der Chance, dass dein
            Kauf komplett erstattet wird. Kein Haken.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
          >
            Zum Shop — probier es aus
          </Link>
        </section>
      </div>

      {/* Author / Footer */}
      <div className="mt-10 border-t pt-6">
        <p className="text-xs text-[var(--muted-foreground)]">
          Geschrieben von Michael Hahnel, Gründer von 1of10. Fragen?{" "}
          <a
            href="mailto:info@medialess.de"
            className="text-[var(--primary)] hover:underline"
          >
            info@medialess.de
          </a>
        </p>
      </div>
    </article>
  );
}
