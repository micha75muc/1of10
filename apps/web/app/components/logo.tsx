/**
 * 1of10 Logo — gray circle with a black "1", followed by "of 10".
 * Replaces the previous golden-ball PNG with a calm monochrome mark.
 */

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 24, text: "text-base", gap: "gap-1.5" },
    md: { icon: 30, text: "text-xl", gap: "gap-2" },
    lg: { icon: 48, text: "text-3xl", gap: "gap-2.5" },
  };
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center ${s.gap}`} aria-label="1of10">
      <LogoBall size={s.icon} />
      <span className={`${s.text} font-semibold tracking-tight text-[var(--foreground)]`}>
        of 10
      </span>
    </span>
  );
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return <LogoBall size={size} />;
}

export function LogoFull({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 40, text: "text-2xl", gap: "gap-2" },
    md: { icon: 64, text: "text-4xl", gap: "gap-3" },
    lg: { icon: 96, text: "text-6xl", gap: "gap-4" },
  };
  const s = sizes[size];

  return (
    <span className="inline-flex flex-col items-center">
      <span className={`inline-flex items-center ${s.gap}`} aria-label="1of10">
        <LogoBall size={s.icon} />
        <span className={`${s.text} font-semibold tracking-tight text-[var(--foreground)]`}>
          of 10
        </span>
      </span>
      {size === "lg" && (
        <span className="mt-3 text-xs tracking-[0.18em] text-[var(--muted-foreground)] uppercase">
          Wir erstatten jeden 10. Kauf
        </span>
      )}
    </span>
  );
}

function LogoBall({ size }: { size: number }) {
  const fontSize = Math.round(size * 0.62);
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-full bg-[var(--secondary)] ring-1 ring-[var(--border)] font-semibold text-[var(--foreground)] leading-none"
      style={{ width: size, height: size, fontSize }}
    >
      1
    </span>
  );
}
