"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { value: "", label: "Alle" },
  { value: "Antivirus", label: "Antivirus" },
  { value: "Internet Security", label: "Internet Security" },
  { value: "Total Security", label: "Total Security" },
  { value: "Office", label: "Office" },
  { value: "Windows", label: "Windows" },
  { value: "VPN", label: "VPN" },
  { value: "Utilities", label: "Utilities" },
  { value: "Backup", label: "Backup" },
  { value: "Mac", label: "Mac" },
] as const;

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Kategorie-Filter">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => handleFilter(cat.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            active === cat.value
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
          }`}
          aria-pressed={active === cat.value}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
