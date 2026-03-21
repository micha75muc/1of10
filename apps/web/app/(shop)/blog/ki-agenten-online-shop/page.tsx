import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wie 21 KI-Agenten unseren Online-Shop betreiben — AI-Native Commerce",
  description:
    "21 spezialisierte KI-Agenten steuern Einkauf, Preise, Compliance und Support bei 1of10. Erfahre, wie AI-Native Commerce funktioniert — transparent und EU AI Act konform.",
  alternates: { canonical: "/blog/ki-agenten-online-shop" },
  openGraph: {
    title: "21 KI-Agenten betreiben unseren Online-Shop",
    description:
      "AI-Native Commerce bei 1of10: Wie KI-Agenten den Shop steuern — und warum das für Kunden besser ist.",
  },
};

export default function BlogPost() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline:
      "Wie 21 KI-Agenten unseren Online-Shop betreiben — AI-Native Commerce",
    description:
      "21 spezialisierte KI-Agenten steuern Einkauf, Preise, Compliance und Support bei 1of10.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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
          Wie 21 KI-Agenten unseren Online-Shop betreiben
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Kein Marketing-Blabla: So funktioniert AI-Native Commerce bei
          1of10 — mit 21 spezialisierten KI-Agenten, die alles von Einkauf bis
          Compliance steuern.
        </p>
      </div>

      {/* Article body */}
      <div className="prose-custom space-y-6 text-[var(--muted-foreground)]">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Die Idee: Ein Shop, der sich selbst betreibt
          </h2>
          <p>
            Die meisten Online-Shops nutzen KI als Zutat — ein Chatbot hier, eine
            Produktempfehlung dort. Bei 1of10 ist KI nicht das Topping, sondern
            die Grundlage. Wir haben den Shop von Anfang an so gebaut, dass er von
            spezialisierten KI-Agenten betrieben wird.
          </p>
          <p>
            Das nennen wir{" "}
            <strong className="text-[var(--foreground)]">
              AI-Native Commerce
            </strong>
            . Nicht „wir haben ChatGPT integriert", sondern: 21 autonome Agenten
            mit klar definierten Zuständigkeiten, die zusammenarbeiten wie ein Team.
            Jeder Agent hat einen Namen, eine Rolle und klare Regeln, was er darf —
            und was nicht.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Die Agenten im Überblick
          </h2>
          <p>
            Hier sind die wichtigsten Agenten und was sie tun:
          </p>

          <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--foreground)]">
            Nestor (Einkauf)
          </h3>
          <p>
            Nestor ist unser Einkaufs-Agent. Er analysiert Distributorkataloge,
            vergleicht Preise, prüft Verfügbarkeiten und schlägt Produkte vor, die
            wir in unser Sortiment aufnehmen sollten. Er kennt unsere Margen,
            unsere Zielgruppe und die aktuelle Marktsituation.
          </p>

          <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--foreground)]">
            Elena (Finanzen)
          </h3>
          <p>
            Elena kalkuliert Preise. Sie berechnet für jedes Produkt den optimalen
            Verkaufspreis — unter Berücksichtigung von Einkaufskosten, Marge,
            Marktpreisen und der 10%-Erstattungsquote. Ohne Elena wäre unser
            Geschäftsmodell nicht profitabel.
          </p>

          <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--foreground)]">
            Denny (Compliance)
          </h3>
          <p>
            Denny ist der Aufpasser. Er prüft jede Aktion der anderen Agenten
            auf Regelkonformität — DSGVO, BGB, EU AI Act, AGB. Wenn ein Agent
            etwas tun will, das gegen die Regeln verstößt, blockiert Denny die
            Aktion sofort.
          </p>

          <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--foreground)]">
            Felix (Frontend)
          </h3>
          <p>
            Felix kümmert sich um die Benutzeroberfläche. Er optimiert
            Produktseiten, passt Texte an und sorgt dafür, dass der Shop schnell
            und benutzerfreundlich ist. Jede Änderung wird von Denny (Compliance)
            geprüft, bevor sie live geht.
          </p>

          <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--foreground)]">
            Clara (Content)
          </h3>
          <p>
            Clara schreibt Texte — Blog-Posts, Produktbeschreibungen,
            Newsletter, rechtliche Seiten. Alles SEO-optimiert, in der
            1of10-Markenstimme und DSGVO-konform. Dieser Artikel? Hat Clara
            geschrieben.
          </p>

          <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--foreground)]">
            Aria (AI-Citation)
          </h3>
          <p>
            Aria sorgt dafür, dass 1of10 von KI-Suchmaschinen wie ChatGPT,
            Perplexity und Google AI Overviews korrekt zitiert wird. Sie
            optimiert strukturierte Daten, Schema-Markup und Inhalte so, dass
            KI-Engines unsere Informationen als vertrauenswürdig einstufen.
          </p>

          <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--foreground)]">
            Inge (Marktforschung)
          </h3>
          <p>
            Inge beobachtet den Markt. Sie analysiert, welche Software-Produkte
            gerade gefragt sind, welche Keywords Potenzial haben und wo Lücken im
            Sortiment bestehen. Ihre Erkenntnisse fließen direkt in die
            Entscheidungen von Nestor (Einkauf) und Clara (Content) ein.
          </p>

          <h3 className="mb-2 mt-4 text-lg font-semibold text-[var(--foreground)]">
            Und viele mehr
          </h3>
          <p>
            Insgesamt arbeiten 21 Agenten an unterschiedlichen Aufgaben: von
            Monitoring und IT-Infrastruktur über Kundensupport bis zu
            Qualitätssicherung. Jeder Agent ist auf eine Domäne spezialisiert und
            arbeitet autonom — innerhalb klar definierter Grenzen.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Risikoklassen: Wie wir KI kontrollieren
          </h2>
          <p>
            „KI macht was sie will" — das ist die Angst, die viele Menschen
            haben. Verständlich. Deshalb haben wir ein System entwickelt, das
            genau das verhindert:{" "}
            <strong className="text-[var(--foreground)]">
              vier Risikoklassen
            </strong>
            .
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--foreground)]">
                Klasse 1 — Read Only:
              </strong>{" "}
              Der Agent darf nur lesen, nicht verändern. Keine Genehmigung nötig.
              Beispiel: Marktpreise abrufen.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Klasse 2 — Draft Proposal:
              </strong>{" "}
              Der Agent erstellt einen Vorschlag, der geloggt wird. Keine
              Blockierung, aber volle Nachvollziehbarkeit. Beispiel: Einen neuen
              Blog-Post-Entwurf erstellen.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Klasse 3 — Operational Write:
              </strong>{" "}
              Der Agent darf Änderungen vornehmen. Jede Aktion wird in der
              Datenbank protokolliert. Beispiel: Einen Produktpreis aktualisieren.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Klasse 4 — High Risk Execution:
              </strong>{" "}
              Die Aktion wird{" "}
              <strong className="text-[var(--foreground)]">blockiert</strong> und
              in eine Approval Queue gestellt. Erst nach Freigabe durch einen
              Menschen wird sie ausgeführt. Beispiel: Eine Rückerstattung über
              500&nbsp;€ auslösen.
            </li>
          </ul>
          <p>
            Jede Aktion, die ein Agent ausführen will, durchläuft dieses System.
            Das bedeutet: Kritische Entscheidungen werden immer von einem
            Menschen geprüft und freigegeben. KI ist bei uns ein Werkzeug — kein
            Autopilot.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            EU AI Act: Warum Compliance kein Afterthought ist
          </h2>
          <p>
            Der EU AI Act verpflichtet Unternehmen zu Transparenz beim Einsatz
            von KI. Für uns ist das keine Pflicht, sondern Prinzip. Wir
            glauben: Wenn du KI einsetzt, musst du erklären können, was sie tut.
          </p>
          <p>
            Deshalb zeigen wir auf unserer{" "}
            <Link
              href="/transparenz"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              Transparenz-Seite
            </Link>{" "}
            offen:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Welche KI-Agenten im Einsatz sind</li>
            <li>Welche Entscheidungen sie treffen</li>
            <li>Wie das Risikoklassen-System funktioniert</li>
            <li>Welche Aktionen einer menschlichen Freigabe bedürfen</li>
          </ul>
          <p>
            Denny (Compliance) prüft laufend, ob alle Agenten die Vorgaben
            einhalten. Änderungen an den Compliance-Regeln werden in der
            Approval Queue geloggt und von Michael (dem Gründer) freigegeben.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Was das für dich als Kunde bedeutet
          </h2>
          <p>
            Klingt alles sehr technisch — aber was hast du als Kunde davon?
            Einiges:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--foreground)]">
                Faire Preise:
              </strong>{" "}
              Elena (Finanzen) kalkuliert jeden Preis datenbasiert — nicht nach
              Bauchgefühl. Du zahlst einen fairen Marktpreis, keine willkürlichen
              Aufschläge.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Schnelle Lieferung:
              </strong>{" "}
              Da die Agenten autonom arbeiten, bekommst du deinen Key sofort nach
              dem Kauf — 24/7, ohne dass jemand manuell eine E-Mail verschicken
              muss.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Aktuelles Sortiment:
              </strong>{" "}
              Nestor (Einkauf) und Inge (Marktforschung) identifizieren
              Trends und neue Produkte in Echtzeit. Unser Sortiment wächst
              schneller als bei einem traditionellen Shop.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Vertrauenswürdigkeit:
              </strong>{" "}
              Denny (Compliance) prüft alles. Du kannst dir sicher sein, dass
              alles, was bei 1of10 passiert, rechtskonform ist — von der
              Preiskalkulation bis zur Datenschutzerklärung.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Transparenz:
              </strong>{" "}
              Du weißt, dass KI im Einsatz ist — und du weißt genau, wofür. Das
              ist mehr, als die meisten Shops bieten.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Die Zukunft: Wohin geht AI-Native Commerce?
          </h2>
          <p>
            Wir stehen am Anfang. Aktuell steuern unsere 21 Agenten die
            Kernprozesse des Shops — aber die Vision geht weiter. In den
            nächsten Monaten werden die Agenten noch enger zusammenarbeiten:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Nestor (Einkauf) wird automatisch nachbestellen, wenn ein Produkt
              unter den Mindestbestand fällt.
            </li>
            <li>
              Clara (Content) wird Produktbeschreibungen in Echtzeit an
              Suchtrends anpassen.
            </li>
            <li>
              Ein neuer Support-Agent wird Kundenanfragen automatisch
              beantworten — natürlich mit menschlicher Eskalation bei komplexen
              Fällen.
            </li>
          </ul>
          <p>
            Alles unter Kontrolle. Alles transparent. Alles mit dem
            Risikoklassen-System als Sicherheitsnetz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-[var(--foreground)]">
            Häufige Fragen zu unseren KI-Agenten
          </h2>

          <div className="space-y-4">
            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
                Werden Kunden-E-Mails von KI gelesen?
              </summary>
              <p className="mt-2">
                Nein. Aktuell werden alle Support-Anfragen von Michael
                persönlich bearbeitet. Zukünftige KI-basierte Support-Funktionen
                werden DSGVO-konform implementiert und klar als KI-generiert
                gekennzeichnet.
              </p>
            </details>

            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
                Kann eine KI entscheiden, ob ich eine Erstattung bekomme?
              </summary>
              <p className="mt-2">
                Die Erstattungsentscheidung basiert auf dem ShuffleBag-Algorithmus —
                einem mathematischen System, nicht auf einer KI-Bewertung. Der
                Algorithmus ist deterministisch und fair. Kein Agent entscheidet
                über deine Erstattung. Mehr dazu in unserem{" "}
                <Link
                  href="/blog/warum-jeder-10-kauf-kostenlos"
                  className="font-medium text-[var(--primary)] hover:underline"
                >
                  Artikel zur Erstattungsmechanik
                </Link>
                .
              </p>
            </details>

            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
                Welche Daten nutzen die KI-Agenten?
              </summary>
              <p className="mt-2">
                Die Agenten arbeiten mit Produktdaten, Marktpreisen und
                aggregierten Shop-Statistiken. Personenbezogene Kundendaten
                werden ausschließlich für die Bestellabwicklung verwendet und
                nicht für KI-Training eingesetzt. Details findest du in unserer{" "}
                <Link
                  href="/datenschutz"
                  className="font-medium text-[var(--primary)] hover:underline"
                >
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </details>

            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
                Was passiert, wenn ein KI-Agent einen Fehler macht?
              </summary>
              <p className="mt-2">
                Genau dafür gibt es das Risikoklassen-System. Kritische Aktionen
                (Klasse 4) werden immer von einem Menschen geprüft, bevor sie
                ausgeführt werden. Für niedrigere Risikoklassen gibt es
                Monitoring und automatische Rollback-Mechanismen.
              </p>
            </details>

            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
                Ist 1of10 EU AI Act konform?
              </summary>
              <p className="mt-2">
                Ja. Wir setzen auf Transparenz (offene Kommunikation über den
                KI-Einsatz), menschliche Kontrolle (Risikoklassen + Approval Queue)
                und Datensparsamkeit (keine personenbezogenen Daten für
                KI-Training). Denny (Compliance) überwacht die Einhaltung
                kontinuierlich.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border bg-[var(--card)] p-6 text-center">
          <p className="text-lg font-bold text-[var(--foreground)]">
            Erlebe AI-Native Commerce in Aktion
          </p>
          <p className="mt-2 text-sm">
            21 KI-Agenten, faire Preise, volle Transparenz — und jeder 10. Kauf
            kostenlos.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
          >
            Zum Shop
          </Link>
        </section>
      </div>

      {/* Author / Footer */}
      <div className="mt-10 border-t pt-6">
        <p className="text-xs text-[var(--muted-foreground)]">
          Geschrieben von Clara (Content-Agentin), geprüft von Michael Hahnel.
          Fragen?{" "}
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
