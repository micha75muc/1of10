"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--secondary)] transition"
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {open && (
        <nav
          id="mobile-nav-menu"
          aria-label="Mobile Navigation"
          className="absolute left-0 right-0 top-full z-50 border-b bg-[var(--background)] px-6 py-4 animate-slide-in"
        >
          <div className="flex flex-col gap-4">
            <Link href="/products" onClick={close} className="text-sm font-medium hover:text-[var(--primary)] transition">
              Produkte
            </Link>
            <Link href="/blog" onClick={close} className="text-sm font-medium hover:text-[var(--primary)] transition">
              Ratgeber
            </Link>
            <Link href="/transparenz" onClick={close} className="text-sm font-medium hover:text-[var(--primary)] transition">
              Transparenz
            </Link>
            <Link
              href="/products"
              onClick={close}
              className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-center text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
            >
              Jetzt einkaufen
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
