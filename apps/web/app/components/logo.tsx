/**
 * 1of10 Wordmark — clean monochrome typographic logo.
 * Replaces the previous golden-ball PNG to match the Apple-style design.
 */

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-base",
    md: "text-[19px]",
    lg: "text-3xl",
  };

  return (
    <span
      className={`inline-flex items-baseline font-semibold tracking-tight text-[var(--foreground)] ${sizes[size]}`}
      aria-label="1of10"
    >
      <span className="text-[var(--muted-foreground)]">1</span>
      <span className="mx-[0.05em] text-[var(--muted-foreground)]">of</span>
      <span>10</span>
    </span>
  );
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  // Compact wordmark — used where only "1/10" makes sense (favicons, dense UI).
  const fontSize = Math.round(size * 0.62);
  return (
    <span
      className="inline-flex items-center justify-center font-semibold tracking-tight text-[var(--foreground)]"
      style={{ width: size, height: size, fontSize }}
      aria-label="1of10"
    >
      <span className="text-[var(--muted-foreground)]">1</span>
      <span className="opacity-60">/</span>
      <span>10</span>
    </span>
  );
}

export function LogoFull({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const display = {
    sm: "text-3xl",
    md: "text-5xl",
    lg: "text-7xl",
  } as const;

  return (
    <span className="inline-flex flex-col items-center">
      <span
        className={`font-semibold tracking-[-0.02em] text-[var(--foreground)] ${display[size]}`}
        aria-label="1of10"
      >
        <span className="text-[var(--muted-foreground)]">1</span>
        <span className="mx-[0.04em] text-[var(--muted-foreground)]">of</span>
        <span>10</span>
      </span>
      {size === "lg" && (
        <span className="mt-3 text-xs tracking-[0.18em] text-[var(--muted-foreground)] uppercase">
          Wir erstatten jeden 10. Kauf
        </span>
      )}
    </span>
  );
}
