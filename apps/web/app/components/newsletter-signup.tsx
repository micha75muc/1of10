"use client";

import { useState } from "react";
import Link from "next/link";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter-Signup — collects emails for the launch list.
 * Conversion: turn abandoning visitors into nurture-list contacts.
 * Compliance: DSGVO Art. 7(1) requires explicit, documented consent —
 * the checkbox MUST be actively set by the user.
 */
export function NewsletterSignup({ variant = "inline" }: { variant?: "inline" | "footer" | "banner" }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = EMAIL_REGEX.test(email) && consent && status !== "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }

      setStatus("success");
      setEmail("");
      setConsent(false);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
    }
  }

  if (status === "success") {
    return (
      <div className={`rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 text-center ${variant === "banner" ? "py-3" : ""}`}>
        <p className="text-sm font-semibold text-[var(--primary)]">
          ✅ Fast geschafft — bitte bestätige den Link in der E-Mail, die wir dir gerade geschickt haben.
        </p>
      </div>
    );
  }

  const consentCheckbox = (
    <label className="mt-2 flex items-start gap-2 cursor-pointer text-left">
      <input
        type="checkbox"
        checked={consent}
        onChange={(e) => setConsent(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0"
        aria-required="true"
      />
      <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
        Ich willige ein, von 1of10 News &amp; Angebote per E-Mail zu erhalten.
        Widerruf jederzeit per Klick im Newsletter oder an{" "}
        <span className="text-[var(--foreground)]">info@medialess.de</span>.
        Es gelten unsere{" "}
        <Link href="/datenschutz" className="underline text-[var(--primary)]" target="_blank">
          Datenschutzhinweise
        </Link>
        .
      </span>
    </label>
  );

  if (variant === "banner") {
    return (
      <div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            required
            className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "…" : "Anmelden"}
          </button>
        </form>
        {consentCheckbox}
        {status === "error" && (
          <p className="mt-2 text-xs text-center text-red-400">{errorMsg ?? "Anmeldung fehlgeschlagen."}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-[var(--card)] p-6">
      <h3 className="mb-2 text-lg font-bold">
        {variant === "footer" ? "Newsletter" : "🔔 Keine Erstattung verpassen"}
      </h3>
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        Erfahre als Erste/r von neuen Produkten, Sonderaktionen und Erstattungs-Statistiken.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            required
            className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "…" : "Anmelden"}
          </button>
        </div>
        {consentCheckbox}
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">{errorMsg ?? "Anmeldung fehlgeschlagen."}</p>
      )}
    </div>
  );
}
