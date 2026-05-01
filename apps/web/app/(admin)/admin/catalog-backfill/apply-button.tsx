"use client";

import { useState } from "react";

export function ApplyButton({ count }: { count: number }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ updated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    if (!confirm(`${count} Produkt(e) jetzt aktivieren?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/backfill-dsd", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setDone({ updated: json.updatedCount ?? 0 });
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        ✓ {done.updated} Produkt(e) aktualisiert. Seite wird neu geladen…
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={apply}
        disabled={busy}
        className="rounded-full bg-[#0071e3] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0077ed] disabled:opacity-50"
      >
        {busy ? "Wird angewendet…" : `${count} Produkt(e) aktivieren`}
      </button>
      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Fehler: {error}
        </div>
      )}
    </div>
  );
}
