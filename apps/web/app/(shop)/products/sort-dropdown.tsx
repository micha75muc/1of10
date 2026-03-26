"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("sort") ?? "";

  function handleSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sort) {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }
    router.push(`/products?${params.toString()}`);
  }

  return (
    <select
      value={active}
      onChange={(e) => handleSort(e.target.value)}
      className="rounded-lg border bg-[var(--card)] px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      aria-label="Sortierung"
    >
      <option value="">Sortierung: Standard</option>
      <option value="price-asc">Preis: aufsteigend</option>
      <option value="price-desc">Preis: absteigend</option>
    </select>
  );
}
