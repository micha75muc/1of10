"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the browser console for debugging in dev / when devtools are open.
    // In production, the digest is the link to the server-side log entry.
    console.error("[ErrorBoundary]", error);
  }, [error]);

  const digest = error.digest ?? "unbekannt";
  const subject = encodeURIComponent(`Fehler auf 1of10 — Ref ${digest}`);
  const body = encodeURIComponent(
    `Hallo,\n\nauf 1of10.de ist ein Fehler aufgetreten.\n\nFehler-ID: ${digest}\nSeite: ${typeof window !== "undefined" ? window.location.href : ""}\n\nKurzbeschreibung was ich gemacht habe:\n\n\nDanke!`,
  );

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl" aria-hidden="true">⚠️</div>
      <h1 className="mb-3 text-3xl font-bold">Etwas ist schiefgelaufen</h1>
      <p className="mb-4 max-w-md text-[var(--muted-foreground)]">
        Ein unerwarteter Fehler ist aufgetreten. Versuche es erneut — wenn es
        weiterhin nicht klappt, schreib uns mit der Fehler-ID unten an{" "}
        <a href="mailto:info@medialess.de" className="underline">
          info@medialess.de
        </a>
        .
      </p>
      <div
        className="mb-8 rounded-lg border bg-[var(--card)] px-4 py-2 text-xs text-[var(--muted-foreground)]"
        aria-label="Fehler-Referenz"
      >
        Fehler-ID:{" "}
        <code className="font-mono text-[var(--foreground)]">{digest}</code>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
        >
          Erneut versuchen
        </button>
        <a
          href="/"
          className="rounded-xl border px-6 py-3 font-semibold hover:bg-[var(--secondary)] transition"
        >
          Zur Startseite
        </a>
        <a
          href={`mailto:info@medialess.de?subject=${subject}&body=${body}`}
          className="rounded-xl border px-6 py-3 font-semibold hover:bg-[var(--secondary)] transition"
        >
          Support kontaktieren
        </a>
      </div>
    </div>
  );
}
