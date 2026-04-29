"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

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
  const [isPending, startTransition] = useTransition();
  const active = searchParams.get("category") ?? "";

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  }

  return (
    <div
      className={`flex flex-wrap gap-2 transition-opacity ${isPending ? "opacity-60" : ""}`}
      role="group"
      aria-label="Kategorie-Filter"
      aria-busy={isPending}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => handleFilter(cat.value)}
          disabled={isPending}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition disabled:cursor-wait ${
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
