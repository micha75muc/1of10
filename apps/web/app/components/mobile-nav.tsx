"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // ESC schließt + Fokus zurück zum Toggle-Button (a11y)
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        // Defer: erst nach State-Update Fokus zurück
        requestAnimationFrame(() => buttonRef.current?.focus());
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Beim Öffnen Fokus auf ersten Link — vermeidet "verlorene" Tastatur-User
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => firstLinkRef.current?.focus());
    }
  }, [open]);

  function handleLinkClick() {
    close();
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
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
        <>
          {/* Outside-Click-Overlay: dezent ausgegraut, schließt Nav bei Klick. */}
          <button
            type="button"
            aria-label="Menü schließen"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 top-16 z-40 bg-black/20 cursor-default"
          />
          <nav
            id="mobile-nav-menu"
            aria-label="Mobile Navigation"
            className="absolute left-0 right-0 top-full z-50 border-b bg-[var(--background)] px-6 py-4 animate-slide-in"
          >
            <div className="flex flex-col gap-4">
              <Link
                ref={firstLinkRef}
                href="/products"
                onClick={handleLinkClick}
                className="text-sm font-medium hover:text-[var(--primary)] transition"
              >
                Produkte
              </Link>
              <Link href="/blog" onClick={handleLinkClick} className="text-sm font-medium hover:text-[var(--primary)] transition">
                Ratgeber
              </Link>
              <Link href="/transparenz" onClick={handleLinkClick} className="text-sm font-medium hover:text-[var(--primary)] transition">
                Transparenz
              </Link>
              <Link href="/bestellstatus" onClick={handleLinkClick} className="text-sm font-medium hover:text-[var(--primary)] transition">
                Bestellstatus
              </Link>
              <Link
                href="/products"
                onClick={handleLinkClick}
                className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-center text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
              >
                Jetzt einkaufen
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
