export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl py-8 space-y-8">
      <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>

      <section>
        <h2 className="mb-3 text-xl font-semibold">1. Verantwortlicher</h2>
        <p>
          Michael Hahnel
          <br />
          Nederlinger Str. 83
          <br />
          80638 München
          <br />
          E-Mail: info@medialess.de
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">
          2. Erhebung und Verarbeitung personenbezogener Daten
        </h2>
        <p className="mb-3">
          Wir verarbeiten personenbezogene Daten nur, soweit dies zur
          Bereitstellung unseres Online-Shops und unserer Leistungen erforderlich
          ist.
        </p>
        <h3 className="mb-2 font-semibold">2.1 Bestellabwicklung</h3>
        <p className="mb-3">
          Bei einer Bestellung erheben wir Ihre E-Mail-Adresse zur Abwicklung
          des Kaufvertrags und zur Zusendung der Bestellbestätigung.
          Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO
          (Vertragserfüllung).
        </p>
        <h3 className="mb-2 font-semibold">2.2 Widerrufsverzicht</h3>
        <p>
          Wir speichern Ihre Zustimmung zum Widerrufsverzicht gemäß BGB §356
          Abs.&nbsp;5 als Nachweis der ordnungsgemäßen Belehrung. Rechtsgrundlage
          ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;c DSGVO (rechtliche
          Verpflichtung).
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">3. Zahlungsabwicklung</h2>
        <p>
          Die Zahlungsabwicklung erfolgt über den Dienstleister Stripe, Inc. (354
          Oyster Point Blvd, South San Francisco, CA 94080, USA). Zur
          Durchführung der Zahlung werden die erforderlichen Zahlungsdaten an
          Stripe übermittelt. Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1
          lit.&nbsp;b DSGVO. Die Datenschutzhinweise von Stripe finden Sie
          unter{" "}
          <a
            href="https://stripe.com/de/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--primary)]"
          >
            stripe.com/de/privacy
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">4. E-Mail-Versand</h2>
        <p>
          Für den Versand von Bestellbestätigungen nutzen wir den Dienst Resend.
          Ihre E-Mail-Adresse wird hierfür an Resend übermittelt. Rechtsgrundlage
          ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO (Vertragserfüllung).
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">
          5. Kaufpreiserstattung (Gamified Refund)
        </h2>
        <p>
          Exakt jeder 10. Kauf wird automatisch erstattet. Die Ermittlung
          erfolgt über ein faires Zufallsverfahren (nicht KI-gesteuert), bei dem
          die Position der Erstattung innerhalb einer Gruppe von 10 Käufen
          zufällig bestimmt wird. Es handelt sich nicht um eine automatisierte
          Entscheidung im Sinne von Art.&nbsp;22 DSGVO.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">
          6. Einsatz von KI-Systemen (EU AI Act)
        </h2>
        <p>
          Im Sinne der Transparenzpflichten des EU AI Act informieren wir Sie
          darüber, dass wir KI-gestützte Systeme (LangGraph-basierte Agenten) für
          interne Geschäftsprozesse einsetzen, insbesondere für Beschaffung,
          Finanzanalyse, Marketing, IT-Support und Compliance-Prüfungen. Diese
          Systeme treffen keine automatisierten Entscheidungen gegenüber Kunden.
          Die Kaufpreiserstattung (Gamified Refund) wird nicht durch KI gesteuert,
          sondern basiert auf einem kryptografisch sicheren Zufallsgenerator.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">7. Ihre Rechte</h2>
        <p className="mb-3">
          Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Recht auf Auskunft (Art.&nbsp;15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art.&nbsp;16 DSGVO)</li>
          <li>Recht auf Löschung (Art.&nbsp;17 DSGVO)</li>
          <li>
            Recht auf Einschränkung der Verarbeitung (Art.&nbsp;18 DSGVO)
          </li>
          <li>Recht auf Datenübertragbarkeit (Art.&nbsp;20 DSGVO)</li>
          <li>Widerspruchsrecht (Art.&nbsp;21 DSGVO)</li>
        </ul>
        <p className="mt-3">
          Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: info@medialess.de
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">8. Beschwerderecht</h2>
        <p>
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über
          die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">9. Speicherdauer</h2>
        <p>
          Personenbezogene Daten werden gelöscht, sobald der Zweck der
          Speicherung entfällt. Für Vertragsdaten gelten die gesetzlichen
          Aufbewahrungsfristen (§147 AO: 10 Jahre, §257 HGB: 6 Jahre).
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">10. Cookies</h2>
        <p>
          Wir verwenden ausschließlich technisch notwendige Cookies, die für den
          Betrieb des Online-Shops erforderlich sind. Es findet kein Tracking
          statt.
        </p>
      </section>
    </div>
  );
}
