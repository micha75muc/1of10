import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum von 1of10 — Michael Hahnel, München. Angaben gemäß DDG §5.",
  alternates: { canonical: "/impressum" },
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Impressum</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Angaben gemäß DDG §5</h2>
        <p className="mb-1">Michael Hahnel</p>
        <p className="mb-1">Vertreten durch: Michael Hahnel</p>
        <p className="mb-1">Nederlinger Str. 83</p>
        <p className="mb-4">80638 München</p>
        <p className="mb-1">
          Einzelunternehmen — kein Handelsregistereintrag
        </p>
        <p className="mb-1 text-sm text-[var(--muted-foreground)]">
          Kleinunternehmer gem. §19 UStG — es wird keine Umsatzsteuer
          ausgewiesen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">Kontakt</h2>
        <p className="mb-1">E-Mail: info@medialess.de</p>
        <p className="mb-1">Telefon: 0152 25389619</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">
          Verantwortlich für den Inhalt nach §18 Abs. 2 MStV
        </h2>
        <p className="mb-1">Michael Hahnel</p>
        <p className="mb-1">Nederlinger Str. 83</p>
        <p className="mb-1">80638 München</p>
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
