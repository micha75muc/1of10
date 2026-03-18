export default function ProductsLoading() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-[var(--secondary)]" />
        <div className="mx-auto h-4 w-72 animate-pulse rounded bg-[var(--secondary)]" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-[var(--card)] p-4 space-y-3">
            <div className="h-40 animate-pulse rounded-lg bg-[var(--secondary)]" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-[var(--secondary)]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--secondary)]" />
            <div className="h-10 animate-pulse rounded-lg bg-[var(--secondary)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
