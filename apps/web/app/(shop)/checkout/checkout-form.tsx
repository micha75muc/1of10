"use client";

import { useState } from "react";
import Link from "next/link";

interface CheckoutFormProps {
  productId: string;
  productName: string;
  price: string;
}

export default function CheckoutForm({
  productId,
  productName,
  price,
}: CheckoutFormProps) {
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [bgbAccepted, setBgbAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = agbAccepted && bgbAccepted && email.includes("@") && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          customerEmail: email,
          dsgvoOptIn: agbAccepted,
          bgbWiderrufOptIn: bgbAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Checkout fehlgeschlagen");
        return;
      }

      // Redirect to Stripe checkout (or mock success URL)
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{productName}</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Digitale Lizenz — Sofort-Download</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold">{price}&nbsp;€</p>
            <p className="text-xs text-[var(--muted-foreground)]">Endpreis</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">E-Mail-Adresse</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div className="space-y-4 rounded-xl border bg-[var(--card)] p-6">
        <h3 className="font-semibold">Rechtliche Zustimmungen</h3>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agbAccepted}
            onChange={(e) => setAgbAccepted(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm">
            Ich stimme den{" "}
            <Link href="/agb" className="underline text-[var(--primary)]" target="_blank">Allgemeinen Geschäftsbedingungen</Link>{" "}
            und der{" "}
            <Link href="/datenschutz" className="underline text-[var(--primary)]" target="_blank">Datenschutzerklärung (DSGVO)</Link> zu.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={bgbAccepted}
            onChange={(e) => setBgbAccepted(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm">
            Ich stimme ausdrücklich zu, dass mit der Ausführung des Vertrags vor
            Ablauf der Widerrufsfrist begonnen wird, und bestätige meine
            Kenntnis, dass ich durch diese Zustimmung mein Widerrufsrecht
            verliere{" "}
            <span className="font-medium">(BGB §356 Abs. 5)</span> —{" "}
            <Link href="/widerruf" className="underline text-[var(--primary)]" target="_blank">Widerrufsbelehrung lesen</Link>.
          </span>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--destructive)] bg-red-50 p-4 text-sm text-[var(--destructive)]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full rounded-xl px-6 py-4 text-center font-bold text-lg transition ${
          canSubmit
            ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 cursor-pointer"
            : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
        }`}
      >
        {loading ? "Wird verarbeitet..." : "Zahlungspflichtig bestellen"}
      </button>

      <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-4 text-center">
        <p className="text-sm font-semibold text-[var(--gold)]">
          🎲 10 % Chance auf volle Erstattung!
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Du behältst die Lizenz in jedem Fall.
        </p>
      </div>
    </form>
  );
}
