"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  Antivirus: "Antivirus",
  "Internet Security": "Internet Security",
  "Total Security": "Total Security",
  Office: "Office",
  Windows: "Windows",
  VPN: "VPN",
  Utilities: "Utilities",
  Backup: "Backup",
  Mac: "Mac",
};

export function CategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const active = searchParams.get("category") ?? "";

  const options = [
    { value: "", label: "Alle" },
    ...categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] ?? c })),
  ];

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
      {options.map((cat) => (
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
