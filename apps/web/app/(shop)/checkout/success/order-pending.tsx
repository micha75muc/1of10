"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Copy, Check } from "lucide-react";

const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 20; // 60 Sekunden max

export function OrderPending() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";
  const [polls, setPolls] = useState(0);
  const [copied, setCopied] = useState(false);
  const timedOut = polls >= MAX_POLLS;

  useEffect(() => {
    if (timedOut) return;
    const timer = setInterval(() => {
      setPolls((prev) => prev + 1);
      router.refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router, timedOut]);

  async function copySessionId() {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked (iOS Safari without HTTPS, etc.) — fall back
      // to a manual selection prompt so the user can still copy.
      window.prompt("Bitte Session-ID kopieren:", sessionId);
    }
  }

  return (
    <div className="mx-auto max-w-md text-center py-12">
      {timedOut ? (
        <>
          <div className="mb-6"><Clock className="h-12 w-12 mx-auto text-[var(--muted-foreground)]" aria-hidden="true" /></div>
          <h1 className="mb-4 text-3xl font-bold">Verarbeitung dauert länger</h1>
          <p className="mb-6 text-[var(--muted-foreground)]">
            Deine Zahlung war erfolgreich. Die Auslieferung des Lizenzschlüssels
            dauert gerade etwas länger als gewöhnlich. In der Regel kommt die
            Bestätigungsmail innerhalb von 30 Minuten an — bitte auch im
            Spam-Ordner nachsehen.
          </p>

          {sessionId && (
            <div className="mb-6 rounded-xl border bg-[var(--card)] p-4 text-left text-sm">
              <p className="mb-2 font-medium">Bei Support-Kontakt bitte diese Session-ID angeben:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-[var(--secondary)] px-2 py-1.5 font-mono text-xs break-all">
                  {sessionId}
                </code>
                <button
                  type="button"
                  onClick={copySessionId}
                  aria-label="Session-ID kopieren"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border hover:bg-[var(--secondary)] transition"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {copied && (
                <p role="status" className="mt-1 text-xs text-[var(--success)]">
                  Kopiert.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setPolls(0);
                router.refresh();
              }}
              className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Erneut prüfen
            </button>
            <a
              href={`mailto:info@medialess.de?subject=Bestellung%20%E2%80%93%20Session-ID%20${encodeURIComponent(sessionId)}&body=Hallo%2C%0A%0Adie%20Auslieferung%20meiner%20Bestellung%20dauert%20l%C3%A4nger%20als%20erwartet.%0A%0ASession-ID%3A%20${encodeURIComponent(sessionId)}%0A%0ABitte%20um%20kurze%20R%C3%BCckmeldung.%0A%0ADanke!`}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-[var(--secondary)] transition"
            >
              Support kontaktieren
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 animate-pulse"><Clock className="h-12 w-12 mx-auto text-[var(--muted-foreground)]" aria-hidden="true" /></div>
          <h1 className="mb-4 text-3xl font-bold">Bestellung wird verarbeitet</h1>
          <p className="text-[var(--muted-foreground)]">
            Deine Zahlung war erfolgreich. Wir holen jetzt deinen Lizenzschlüssel
            beim Lizenzgeber — diese Seite aktualisiert sich automatisch, du
            musst nichts tun.
          </p>
          <p className="mt-4 text-xs text-[var(--muted-foreground)]" aria-live="polite">
            Status wird alle {POLL_INTERVAL_MS / 1000} Sekunden geprüft… ({polls}/{MAX_POLLS})
          </p>
        </>
      )}
    </div>
  );
}
