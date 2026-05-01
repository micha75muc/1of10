import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB — Allgemeine Geschäftsbedingungen",
  description:
    "Allgemeine Geschäftsbedingungen von 1of10. Regelungen zu Vertragsschluss, Preisen, Lieferung digitaler Inhalte und Erstattungen.",
  alternates: { canonical: "/agb" },
  robots: { index: true, follow: true },
};

export default function AGBPage() {
  return (
    <div className="mx-auto max-w-3xl py-8 space-y-8">
      <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>

      <section>
        <h2 className="mb-3 text-xl font-semibold">§1 Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge,
          die über den Online-Shop von 1of10 (nachfolgend
          &ldquo;Anbieter&rdquo;) geschlossen werden. Der Online-Shop richtet
          sich an Verbraucher und Unternehmer. Entgegenstehende oder abweichende
          Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Anbieter
          stimmt ihrer Geltung ausdrücklich schriftlich zu.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">§2 Vertragsschluss</h2>
        <p className="mb-3">
          Die Darstellung der Produkte im Online-Shop stellt kein rechtlich
          bindendes Angebot, sondern eine Einladung zur Abgabe einer Bestellung
          dar.
        </p>
        <p>
          Durch Anklicken des Buttons &ldquo;Zahlungspflichtig bestellen&rdquo;
          geben Sie eine verbindliche Bestellung der im Warenkorb enthaltenen
          Produkte ab. Die Bestätigung des Eingangs Ihrer Bestellung erfolgt
          unmittelbar nach dem Absenden per E-Mail und stellt die Annahme Ihres
          Angebots dar.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">
          §3 Preise und Zahlung
        </h2>
        <p className="mb-3">
          Alle angegebenen Preise sind Endpreise in Euro. Gemäß §19 UStG
          wird keine Umsatzsteuer erhoben und daher auch nicht ausgewiesen
          (Kleinunternehmerregelung).
        </p>
        <p>
          Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Es stehen
          die von Stripe angebotenen Zahlungsmethoden zur Verfügung.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">
          §4 Lieferung digitaler Inhalte
        </h2>
        <p>
          Der Anbieter vertreibt digitale Produkte (Software, Game-Keys,
          Guthaben und vergleichbare digitale Inhalte). Die
          Bereitstellung erfolgt unverzüglich nach Zahlungseingang durch
          elektronische Übermittlung (E-Mail). Mit der Bereitstellung der Lizenz
          gilt die Leistung als erbracht.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">
          §5 Freiwillige Kaufpreiserstattung (Kulanz)
        </h2>
        <p className="mb-3">
          Der Anbieter gewährt als einseitige, freiwillige Kulanzleistung die
          Erstattung statistisch jedes 10. Kaufs. Es besteht kein
          Rechtsanspruch auf Erstattung. Die Ermittlung erfolgt über ein faires, nicht
          manipulierbares Verfahren: Jeweils 10 aufeinanderfolgende Käufe bilden
          eine Gruppe, in der genau ein Kauf für die Erstattung vorgesehen ist.
          Die Position innerhalb der Gruppe wird zufällig und nicht
          vorhersehbar bestimmt.
        </p>
        <p className="mb-3">
          Es handelt sich hierbei nicht um ein Glücksspiel im Sinne des
          Glücksspielstaatsvertrags, sondern um eine freiwillige
          Kaufpreiserstattung durch den Verkäufer. Die Erstattung erfolgt
          unabhängig vom Widerruf und berührt die Gültigkeit des erworbenen
          Produkts nicht. Der Kunde behält das Produkt auch im Falle einer
          Erstattung.
        </p>
        <p>
          Die Erstattung erfolgt automatisch über den Zahlungsdienstleister
          Stripe auf das ursprünglich verwendete Zahlungsmittel.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">
          §6 Widerrufsrecht und Widerrufsverzicht
        </h2>
        <p className="mb-3">
          Verbrauchern steht grundsätzlich ein Widerrufsrecht gemäß §355 BGB zu.
          Die vollständige Widerrufsbelehrung finden Sie unter{" "}
          <a
            href="/widerruf"
            className="underline text-[var(--primary)]"
          >
            Widerrufsbelehrung
          </a>
          .
        </p>
        <p>
          Für digitale Inhalte, die nicht auf einem körperlichen Datenträger
          geliefert werden, erlischt das Widerrufsrecht vorzeitig, wenn der
          Unternehmer mit der Ausführung des Vertrags begonnen hat, nachdem der
          Verbraucher ausdrücklich zugestimmt hat, dass der Unternehmer mit der
          Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnt, und
          seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit
          Beginn der Ausführung des Vertrags sein Widerrufsrecht verliert (§356
          Abs.&nbsp;5 BGB). Diese Zustimmung wird im Rahmen des
          Bestellvorgangs eingeholt.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">§7 Haftung</h2>
        <p className="mb-3">
          Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit.
          Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung
          wesentlicher Vertragspflichten (Kardinalpflichten), deren Erfüllung die
          ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht.
        </p>
        <p>
          Die Haftung für mittelbare Schäden und Folgeschäden aus der Nutzung der
          digitalen Produkte ist ausgeschlossen, soweit gesetzlich zulässig.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">§8 Datenschutz</h2>
        <p>
          Informationen zur Verarbeitung personenbezogener Daten finden Sie in
          unserer{" "}
          <a
            href="/datenschutz"
            className="underline text-[var(--primary)]"
          >
            Datenschutzerklärung
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">§9 Schlussbestimmungen</h2>
        <p className="mb-3">
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur insoweit, als
          nicht der gewährte Schutz durch zwingende Bestimmungen des Rechts des
          Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat,
          entzogen wird.
        </p>
        <p>
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden,
          bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </section>

      <p className="text-sm text-[var(--muted-foreground)] pt-4">
        Stand: März 2026
      </p>
    </div>
  );
}
