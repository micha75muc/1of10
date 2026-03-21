"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl">⚠️</div>
      <h1 className="mb-3 text-3xl font-bold">Etwas ist schiefgelaufen</h1>
      <p className="mb-8 max-w-md text-[var(--muted-foreground)]">
        Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut oder
        kehre zur Startseite zurück.
      </p>
      <div className="flex gap-4">
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
      </div>
    </div>
  );
}
