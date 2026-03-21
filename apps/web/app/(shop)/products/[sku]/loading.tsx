export default function ProductDetailLoading() {
  return (
    <div className="py-4">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-[var(--secondary)]" />
        <span className="text-[var(--muted-foreground)]">/</span>
        <div className="h-4 w-16 animate-pulse rounded bg-[var(--secondary)]" />
        <span className="text-[var(--muted-foreground)]">/</span>
        <div className="h-4 w-40 animate-pulse rounded bg-[var(--secondary)]" />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Bild Skeleton */}
        <div className="aspect-[4/3] animate-pulse rounded-xl bg-[var(--secondary)]" />

        {/* Info Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--secondary)]" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-[var(--secondary)]" />
          </div>
          <div className="h-8 w-3/4 animate-pulse rounded bg-[var(--secondary)]" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-[var(--secondary)]" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--secondary)]" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded bg-[var(--secondary)]" />
          <div className="h-5 w-32 animate-pulse rounded bg-[var(--secondary)]" />
          <div className="h-20 animate-pulse rounded-xl bg-[var(--secondary)]" />
          <div className="h-14 animate-pulse rounded-lg bg-[var(--secondary)]" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 animate-pulse rounded-lg bg-[var(--secondary)]" />
            <div className="h-20 animate-pulse rounded-lg bg-[var(--secondary)]" />
            <div className="h-20 animate-pulse rounded-lg bg-[var(--secondary)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
