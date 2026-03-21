import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ratgeber — Software-Vergleiche, Tests & Tipps",
  description:
    "Software-Ratgeber von 1of10: Vergleiche, Tests und Tipps zu Antivirus, VPN, Audio-Plugins, Foto-Software und mehr. Unabhängig und aktuell.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Software-Ratgeber | 1of10",
    description:
      "Vergleiche, Tests und Tipps zu digitaler Software — Antivirus, VPN, Plugins und mehr.",
  },
};

// Static blog posts — Inge can generate more via LLM
const POSTS = [
  {
    slug: "warum-jeder-10-kauf-kostenlos",
    title: "Warum wir jedem 10. Kunden den Kaufpreis erstatten",
    excerpt:
      "Welcher Shop gibt freiwillig Geld zurück? Wir. Und das hat einen guten Grund. So funktioniert das 1of10-Prinzip — und warum es für alle ein guter Deal ist.",
    category: "1of10 Inside",
    date: "2026-03-21",
    published: true,
  },
  {
    slug: "software-lizenzen-legal-kaufen",
    title:
      "Software-Lizenzen legal und günstig kaufen — der komplette Guide 2026",
    excerpt:
      "Sind günstige Software-Lizenzen legal? Ja! ESD-Lizenzen, EU-Erschöpfungsgrundsatz und worauf du beim Kauf achten musst — der komplette Guide.",
    category: "Ratgeber",
    date: "2026-03-21",
    published: true,
  },
  {
    slug: "gamified-commerce-zukunft",
    title:
      "Gamified Commerce: Warum die Zukunft des Online-Shoppings spielerisch ist",
    excerpt:
      "Von Spin-the-Wheel bis Kaufpreiserstattung: Wie Gamification den E-Commerce verändert — und warum 1of10 es fair und transparent macht.",
    category: "Trends",
    date: "2026-03-21",
    published: true,
  },
  {
    slug: "ki-agenten-online-shop",
    title: "Wie 21 KI-Agenten unseren Online-Shop betreiben",
    excerpt:
      "21 spezialisierte KI-Agenten steuern Einkauf, Preise, Compliance und Support bei 1of10. So funktioniert AI-Native Commerce — transparent und EU AI Act konform.",
    category: "1of10 Inside",
    date: "2026-03-21",
    published: true,
  },
  {
    slug: "norton-vs-bitdefender-vs-mcafee",
    title: "Norton vs. Bitdefender vs. McAfee 2026 — Welcher Antivirus ist der beste?",
    excerpt:
      "Ehrlicher Vergleich der drei besten Antivirus-Programme 2026: Funktionen, Preise, Vor- und Nachteile.",
    category: "Sicherheit",
    date: "2026-03-21",
    published: true,
  },
  {
    slug: "braucht-man-antivirus-2026",
    title: "Braucht man 2026 noch Antivirus-Software?",
    excerpt:
      "Reicht der Windows Defender 2026 aus? Wir erklären, wann du zusätzlichen Antivirus-Schutz brauchst — und wann nicht.",
    category: "Ratgeber",
    date: "2026-03-21",
    published: true,
  },
  {
    slug: "beste-antivirus-software-2026",
    title: "Die beste Antivirus-Software 2026 im Vergleich",
    excerpt:
      "Norton, Bitdefender, Kaspersky oder McAfee? Wir vergleichen die Top-Antivirus-Programme nach Schutz, Preis und Funktionen.",
    category: "Sicherheit",
    date: "2026-03-15",
    published: false,
  },
  {
    slug: "vpn-vergleich-deutschland",
    title: "VPN-Vergleich 2026: NordVPN vs. Surfshark vs. CyberGhost",
    excerpt:
      "Welcher VPN-Dienst ist der beste für Deutschland? Geschwindigkeit, Datenschutz und Preis im direkten Vergleich.",
    category: "Sicherheit",
    date: "2026-03-15",
    published: false,
  },
  {
    slug: "audio-plugins-fuer-einsteiger",
    title: "Die 5 besten Audio-Plugins für Einsteiger (2026)",
    excerpt:
      "Von FabFilter bis iZotope — welche Plugins lohnen sich wirklich für den Einstieg in die Musikproduktion?",
    category: "Audio",
    date: "2026-03-15",
    published: false,
  },
  {
    slug: "foto-software-vergleich",
    title: "Capture One vs. Affinity Photo vs. Lightroom — was lohnt sich?",
    excerpt:
      "Drei professionelle Foto-Editoren im Vergleich. Einmalkauf oder Abo? Wir klären auf.",
    category: "Foto & Video",
    date: "2026-03-15",
    published: false,
  },
  {
    slug: "backup-software-test",
    title: "Backup-Software im Test: Acronis, AOMEI & EaseUS",
    excerpt:
      "Datenverlust vorbeugen — welche Backup-Software bietet das beste Preis-Leistungs-Verhältnis?",
    category: "Utility",
    date: "2026-03-15",
    published: false,
  },
];

export default function BlogPage() {
  return (
    <div className="py-4">
      <h1 className="mb-3 text-3xl font-bold">Ratgeber</h1>
      <p className="mb-8 text-[var(--muted-foreground)]">
        Vergleiche, Tests und Tipps — damit du die richtige Software findest.
        Und nicht vergessen: Wir erstatten jeden 10. Kauf.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {POSTS.map((post) => {
          const inner = (
            <>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[var(--primary)]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                  {post.category}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {new Date(post.date).toLocaleDateString("de-DE")}
                </span>
              </div>
              <h2 className="mb-2 text-lg font-bold group-hover:text-[var(--primary)] transition">
                {post.title}
              </h2>
              <p className="mb-4 text-sm text-[var(--muted-foreground)]">
                {post.excerpt}
              </p>
              <span className="text-sm font-medium text-[var(--primary)]">
                {post.published ? "Weiterlesen →" : "Bald verfügbar →"}
              </span>
            </>
          );

          return post.published ? (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border bg-[var(--card)] p-6 transition hover:border-[var(--primary)]/50"
            >
              {inner}
            </Link>
          ) : (
            <article
              key={post.slug}
              className="group rounded-xl border bg-[var(--card)] p-6 transition hover:border-[var(--primary)]/50"
            >
              {inner}
            </article>
          );
        })}
      </div>
    </div>
  );
}
