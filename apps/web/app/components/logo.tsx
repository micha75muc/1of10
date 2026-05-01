/**
 * 1of10 Logo — frosted-glass pill with a raised inner disc carrying a navy
 * "1" on the left and a bold "of 10" wordmark on the right. Inline SVG so it
 * stays crisp at any size and inherits the page background through the white
 * pill highlights.
 *
 * Sizes are expressed as a target HEIGHT in px; the pill's natural aspect
 * ratio (≈ 2.75:1) sets the rendered width.
 */

const PILL_W = 1100;
const PILL_H = 400;
const PILL_RATIO = PILL_W / PILL_H;

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heights: Record<string, number> = { sm: 28, md: 36, lg: 56 };
  const h = heights[size];
  return <Pill height={h} aria-label="1of10" />;
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return <Disc size={size} aria-label="1of10" />;
}

export function LogoFull({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heights: Record<string, number> = { sm: 56, md: 88, lg: 132 };
  const h = heights[size];
  return (
    <span className="inline-flex flex-col items-center">
      <Pill height={h} aria-label="1of10" />
      {size === "lg" && (
        <span className="mt-3 text-xs tracking-[0.18em] text-[var(--muted-foreground)] uppercase">
          Wir erstatten jeden 10. Kauf
        </span>
      )}
    </span>
  );
}

function Pill({ height, ...rest }: { height: number; "aria-label"?: string }) {
  const width = Math.round(height * PILL_RATIO);
  return (
    <svg
      role="img"
      aria-label={rest["aria-label"]}
      width={width}
      height={height}
      viewBox={`0 0 ${PILL_W} ${PILL_H}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pill-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f4f6fa" />
          <stop offset="100%" stopColor="#e2e7f0" />
        </linearGradient>
        <linearGradient id="pill-edge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="disc-fill" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="78%" stopColor="#f7f9fc" />
          <stop offset="100%" stopColor="#dde3ee" />
        </radialGradient>
        <filter id="pill-shadow" x="-5%" y="-10%" width="110%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0a1f5c" floodOpacity="0.10" />
        </filter>
        <filter id="disc-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#0a1f5c" floodOpacity="0.18" />
        </filter>
      </defs>
      {/* Outer pill */}
      <rect
        x="10" y="14" width={PILL_W - 20} height={PILL_H - 28}
        rx={(PILL_H - 28) / 2}
        fill="url(#pill-fill)"
        stroke="url(#pill-edge)"
        strokeWidth="6"
        filter="url(#pill-shadow)"
      />
      {/* Inner highlight ring */}
      <rect
        x="22" y="26" width={PILL_W - 44} height={PILL_H - 52}
        rx={(PILL_H - 52) / 2}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.7"
        strokeWidth="2"
      />
      {/* Raised inner disc */}
      <circle cx="220" cy="200" r="160" fill="url(#disc-fill)" filter="url(#disc-shadow)" />
      {/* "1" inside the disc */}
      <text
        x="220" y="200"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif"
        fontSize="248"
        fontWeight="900"
        fill="#0a2a6c"
      >1</text>
      {/* "of 10" wordmark */}
      <text
        x="430" y="200"
        dominantBaseline="central"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif"
        fontSize="232"
        fontWeight="900"
        fill="#0a0a0a"
        letterSpacing="-6"
      >of 10</text>
    </svg>
  );
}

function Disc({ size, ...rest }: { size: number; "aria-label"?: string }) {
  return (
    <svg
      role="img"
      aria-label={rest["aria-label"]}
      width={size}
      height={size}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="disc-only-fill" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="78%" stopColor="#f7f9fc" />
          <stop offset="100%" stopColor="#dde3ee" />
        </radialGradient>
        <filter id="disc-only-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0a1f5c" floodOpacity="0.20" />
        </filter>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#disc-only-fill)" stroke="#dfe5ef" strokeWidth="2" filter="url(#disc-only-shadow)" />
      <text
        x="200" y="200"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif"
        fontSize="278"
        fontWeight="900"
        fill="#0a2a6c"
      >1</text>
    </svg>
  );
}
