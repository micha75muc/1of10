"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 20; // 60 Sekunden max

export function OrderPending() {
  const router = useRouter();
  const [polls, setPolls] = useState(0);
  const timedOut = polls >= MAX_POLLS;

  useEffect(() => {
    if (timedOut) return;
    const timer = setInterval(() => {
      setPolls((prev) => prev + 1);
      router.refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router, timedOut]);

  return (
    <div className="mx-auto max-w-md text-center py-12">
      {timedOut ? (
        <>
          <div className="mb-6"><Clock className="h-12 w-12 mx-auto text-[var(--muted-foreground)]" /></div>
          <h1 className="mb-4 text-3xl font-bold">Verarbeitung dauert länger</h1>
          <p className="text-[var(--muted-foreground)]">
            Deine Zahlung war erfolgreich! Die Verarbeitung dauert etwas länger als gewöhnlich.
            Bitte lade die Seite in ein paar Minuten erneut oder kontaktiere uns unter info@medialess.de.
          </p>
          <button
            onClick={() => router.refresh()}
            className="mt-6 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
          >
            Erneut prüfen
          </button>
        </>
      ) : (
        <>
          <div className="mb-6 animate-pulse"><Clock className="h-12 w-12 mx-auto text-[var(--muted-foreground)]" /></div>
          <h1 className="mb-4 text-3xl font-bold">Bestellung wird verarbeitet</h1>
          <p className="text-[var(--muted-foreground)]">
            Deine Zahlung war erfolgreich! Deine Bestellung wird gerade verarbeitet.
            Diese Seite aktualisiert sich automatisch.
          </p>
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Prüfe automatisch alle {POLL_INTERVAL_MS / 1000} Sekunden…
          </p>
        </>
      )}
    </div>
  );
}
