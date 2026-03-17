/**
 * 1of10 Logo — SVG-based, no external assets needed.
 * Uses the "golden ball" concept from the Shuffle Bag.
 */

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { height: 28, text: "text-lg", ball: 20, fontSize: 11 },
    md: { height: 36, text: "text-xl", ball: 26, fontSize: 14 },
    lg: { height: 56, text: "text-4xl", ball: 40, fontSize: 22 },
  };
  const s = sizes[size];

  return (
    <span className="inline-flex items-center gap-1.5 font-extrabold tracking-tight">
      {/* The golden ball with "1" */}
      <svg
        width={s.ball}
        height={s.ball}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer ring */}
        <circle cx="20" cy="20" r="18" stroke="url(#gold-gradient)" strokeWidth="2.5" fill="none" />
        {/* Inner filled circle */}
        <circle cx="20" cy="20" r="14" fill="url(#gold-gradient)" />
        {/* Shine highlight */}
        <ellipse cx="15" cy="14" rx="5" ry="4" fill="white" opacity="0.25" />
        {/* Number 1 */}
        <text
          x="20"
          y="25"
          textAnchor="middle"
          fill="#0F172A"
          fontWeight="900"
          fontSize="18"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          1
        </text>
        <defs>
          <linearGradient id="gold-gradient" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>
      {/* Text part */}
      <span className={s.text}>
        <span className="text-[var(--muted-foreground)] font-bold">of</span>
        <span className="text-[var(--foreground)] font-extrabold">10</span>
      </span>
    </span>
  );
}

export function LogoFull({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <span className="inline-flex flex-col items-start">
      <Logo size={size} />
      {size === "lg" && (
        <span className="mt-1 text-xs tracking-widest text-[var(--muted-foreground)] uppercase">
          Wir erstatten jeden 10. Kauf
        </span>
      )}
    </span>
  );
}
