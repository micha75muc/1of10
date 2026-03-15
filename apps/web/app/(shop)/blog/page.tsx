import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ratgeber — Software-Vergleiche & Tipps",
  description:
    "Vergleiche, Tests und Tipps zu digitaler Software. Antivirus, VPN, Audio-Plugins, Foto-Software und mehr.",
};

// Static blog posts — Inge can generate more via LLM
const POSTS = [
  {
    slug: "beste-antivirus-software-2026",
    title: "Die beste Antivirus-Software 2026 im Vergleich",
    excerpt:
      "Norton, Bitdefender, Kaspersky oder McAfee? Wir vergleichen die Top-Antivirus-Programme nach Schutz, Preis und Funktionen.",
    category: "Sicherheit",
    date: "2026-03-15",
  },
  {
    slug: "vpn-vergleich-deutschland",
    title: "VPN-Vergleich 2026: NordVPN vs. Surfshark vs. CyberGhost",
    excerpt:
      "Welcher VPN-Dienst ist der beste für Deutschland? Geschwindigkeit, Datenschutz und Preis im direkten Vergleich.",
    category: "Sicherheit",
    date: "2026-03-15",
  },
  {
    slug: "audio-plugins-fuer-einsteiger",
    title: "Die 5 besten Audio-Plugins für Einsteiger (2026)",
    excerpt:
      "Von FabFilter bis iZotope — welche Plugins lohnen sich wirklich für den Einstieg in die Musikproduktion?",
    category: "Audio",
    date: "2026-03-15",
  },
  {
    slug: "foto-software-vergleich",
    title: "Capture One vs. Affinity Photo vs. Lightroom — was lohnt sich?",
    excerpt:
      "Drei professionelle Foto-Editoren im Vergleich. Einmalkauf oder Abo? Wir klären auf.",
    category: "Foto & Video",
    date: "2026-03-15",
  },
  {
    slug: "backup-software-test",
    title: "Backup-Software im Test: Acronis, AOMEI & EaseUS",
    excerpt:
      "Datenverlust vorbeugen — welche Backup-Software bietet das beste Preis-Leistungs-Verhältnis?",
    category: "Utility",
    date: "2026-03-15",
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
        {POSTS.map((post) => (
          <article
            key={post.slug}
            className="group rounded-xl border bg-[var(--card)] p-6 transition hover:border-[var(--primary)]/50"
          >
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
              Bald verfügbar →
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
