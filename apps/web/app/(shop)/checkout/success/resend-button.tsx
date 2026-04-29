"use client";

import { useState } from "react";
import { CheckCircle, RefreshCw } from "lucide-react";

interface ResendButtonProps {
  orderId: string;
  sessionId: string;
}

/**
 * Sends a re-issue request for the order confirmation email. Idempotent on
 * the server side; rate-limited per IP. Inline status: idle → sending → sent
 * (oder error mit Recovery-Hinweis). Bewusst KEIN Toast — Inline-Feedback
 * ist verlässlicher (Toast könnte abgeschnitten werden, fehlt bei
 * Screen-Readern ohne aria-live).
 */
export function ResendButton({ orderId, sessionId }: ResendButtonProps) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleClick() {
    if (state === "sending" || state === "sent") return;
    setState("sending");
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(
          data.error ??
            "Wir konnten die Mail gerade nicht erneut senden. Bitte versuche es in einer Minute erneut.",
        );
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setErrorMsg(
        "Netzwerkfehler — bitte prüfe deine Internetverbindung und versuche es erneut.",
      );
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p
        role="status"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--success)]/10 px-3 py-2 text-sm font-medium text-[var(--success)]"
      >
        <CheckCircle className="h-4 w-4" aria-hidden="true" />
        Mail wurde erneut zugestellt — bitte Postfach (inkl. Spam) prüfen.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "sending"}
        aria-busy={state === "sending"}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition"
      >
        <RefreshCw
          className={`h-4 w-4 ${state === "sending" ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
        {state === "sending" ? "Wird gesendet…" : "Bestätigung erneut senden"}
      </button>
      {state === "error" && errorMsg && (
        <p
          role="alert"
          className="text-xs text-[var(--destructive)]"
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
}
