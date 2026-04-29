"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { SEARCH_DEBOUNCE_MS } from "../../../lib/constants";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  // Debounce: URL erst nach SEARCH_DEBOUNCE_MS Tippruhe aktualisieren.
  // useTransition markiert das Update als low-priority, sodass das
  // Eingabefeld responsiv bleibt und wir einen Pending-Indicator zeigen.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.push(`/products?${params.toString()}`);
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  return (
    <div className="relative" aria-busy={isPending}>
      {isPending ? (
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--primary)]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Produkt suchen…"
        className="w-full rounded-lg border bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        aria-label="Produkte durchsuchen"
      />
    </div>
  );
}
