export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Impressum</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Angaben gemäß DDG §5</h2>
        <p className="mb-1">[Firmenname]</p>
        <p className="mb-1">Vertreten durch: [Vorname Nachname]</p>
        <p className="mb-1">[Straße Nr.]</p>
        <p className="mb-4">[PLZ Ort]</p>
        <p className="mb-1">
          Handelsregister: [Registergericht], [HRB-Nummer]
        </p>
        <p className="mb-1 text-sm text-[var(--muted-foreground)]">
          Kleinunternehmer gem. §19 UStG — es wird keine Umsatzsteuer
          ausgewiesen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Kontakt</h2>
        <p className="mb-1">E-Mail: [email@example.de]</p>
        <p className="mb-1">Telefon: [+49 000 0000000]</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          Verantwortlich für den Inhalt nach §18 Abs. 2 MStV
        </h2>
        <p className="mb-1">[Vorname Nachname]</p>
        <p className="mb-1">[Straße Nr.]</p>
        <p className="mb-1">[PLZ Ort]</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">EU-Streitschlichtung</h2>
        <p className="text-[var(--muted-foreground)]">
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--primary)]"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht
          bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>
    </div>
  );
}
