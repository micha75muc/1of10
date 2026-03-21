"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "1of10-cookie-notice-seen";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — don't show
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--muted)] bg-[var(--background)]/95 backdrop-blur-sm px-4 py-3 text-sm text-[var(--foreground)]"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-relaxed">
          Diese Website nutzt ausschließlich technisch notwendige Cookies (z.B.
          für die Admin-Anmeldung) und cookie-freies Analytics (Plausible). Kein
          Tracking, kein Profiling.{" "}
          <Link
            href="/datenschutz"
            className="underline text-[var(--primary)]"
          >
            Mehr erfahren
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
