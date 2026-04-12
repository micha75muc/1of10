"use client";

import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter-Signup — sammelt E-Mails für die Launch-Liste.
 * Gregor (Growth): Besucher die nicht kaufen → E-Mail statt verloren.
 */
export function NewsletterSignup({ variant = "inline" }: { variant?: "inline" | "footer" | "banner" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed");

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={`rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 text-center ${variant === "banner" ? "py-3" : ""}`}>
        <p className="text-sm font-semibold text-[var(--primary)]">
          ✅ Du bist dabei! Wir benachrichtigen dich bei Neuigkeiten.
        </p>
      </div>
    );
  }

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
            disabled={status === "loading"}
            className="shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
          >
            {status === "loading" ? "…" : "Anmelden"}
          </button>
        </form>
        {status === "error" && (
          <p className="mt-2 text-xs text-center text-red-400">Anmeldung fehlgeschlagen. Bitte versuche es erneut.</p>
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
      <form onSubmit={handleSubmit} className="flex gap-2">
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
          disabled={status === "loading"}
          className="shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
        >
          {status === "loading" ? "…" : "Anmelden"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Anmeldung fehlgeschlagen. Bitte versuche es erneut.</p>
      )}
    </div>
  );
}
