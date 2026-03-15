export default function WiderrufPage() {
  return (
    <div className="mx-auto max-w-3xl py-8 space-y-8">
      <h1 className="text-3xl font-bold">Widerrufsbelehrung</h1>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Widerrufsrecht</h2>
        <p className="mb-3">
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage
          ab dem Tag des Vertragsabschlusses.
        </p>
        <p className="mb-3">
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ([Firmenname],
          [Straße Nr.], [PLZ Ort], E-Mail: [email@example.de]) mittels einer
          eindeutigen Erklärung (z.&nbsp;B. ein mit der Post versandter Brief
          oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen,
          informieren.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung
          über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist
          absenden.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Folgen des Widerrufs</h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen
          vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
          Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese
          Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
          ursprünglichen Transaktion eingesetzt haben.
        </p>
      </section>

      <section className="rounded-lg border border-yellow-300 bg-yellow-50 p-6">
        <h2 className="mb-3 text-xl font-semibold text-yellow-800">
          Vorzeitiges Erlöschen des Widerrufsrechts bei digitalen Inhalten
        </h2>
        <p className="text-yellow-900">
          Das Widerrufsrecht erlischt bei Verträgen zur Lieferung von digitalen
          Inhalten, die nicht auf einem körperlichen Datenträger geliefert
          werden, wenn der Unternehmer mit der Ausführung des Vertrags begonnen
          hat, nachdem der Verbraucher
        </p>
        <ol className="list-decimal pl-6 mt-3 space-y-2 text-yellow-900">
          <li>
            ausdrücklich zugestimmt hat, dass der Unternehmer mit der Ausführung
            des Vertrags vor Ablauf der Widerrufsfrist beginnt, und
          </li>
          <li>
            seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung
            mit Beginn der Ausführung des Vertrags sein Widerrufsrecht verliert
          </li>
        </ol>
        <p className="mt-3 text-yellow-900">(§356 Abs.&nbsp;5 BGB).</p>
        <p className="mt-3 font-semibold text-yellow-800">
          Diese Zustimmung wird im Rahmen des Bestellvorgangs durch eine
          separate Checkbox eingeholt.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">
          Muster-Widerrufsformular
        </h2>
        <p className="mb-3 text-[var(--muted-foreground)]">
          (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses
          Formular aus und senden Sie es zurück.)
        </p>
        <div className="rounded-lg border p-6 space-y-3">
          <p>
            An: [Firmenname], [Straße Nr.], [PLZ Ort], [email@example.de]
          </p>
          <p>
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*)
            abgeschlossenen Vertrag über den Kauf der folgenden Waren (*) / die
            Erbringung der folgenden Dienstleistung (*)
          </p>
          <p>Bestellt am (*) / erhalten am (*): _______________</p>
          <p>Name des/der Verbraucher(s): _______________</p>
          <p>Anschrift des/der Verbraucher(s): _______________</p>
          <p>Datum: _______________</p>
          <p>
            Unterschrift (nur bei Mitteilung auf Papier): _______________
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            (*) Unzutreffendes streichen.
          </p>
        </div>
      </section>
    </div>
  );
}
