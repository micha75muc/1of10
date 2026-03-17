/**
 * 1of10 Logo — Uses the golden ball PNG logo.
 * Fallback to SVG if image not available.
 */

import Image from "next/image";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 56, text: "text-4xl" },
  };
  const s = sizes[size];

  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/logo-icon.png"
        alt="1of10"
        width={s.icon}
        height={s.icon}
        priority
        className="object-contain"
      />
      <span className={`${s.text} font-extrabold tracking-tight`}>
        <span className="text-[var(--muted-foreground)] font-bold">of</span>
        <span className="text-[var(--foreground)]">10</span>
      </span>
    </span>
  );
}

export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo-icon.png"
      alt="1of10"
      width={size}
      height={size}
      priority
      className="object-contain"
    />
  );
}

export function LogoFull({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { width: 150, height: 40 },
    md: { width: 220, height: 58 },
    lg: { width: 320, height: 85 },
  };
  const s = sizes[size];

  return (
    <span className="inline-flex flex-col items-center">
      <Image
        src="/logo.png"
        alt="1of10 — Wir erstatten jeden 10. Kauf"
        width={s.width}
        height={s.height}
        priority
        className="object-contain"
      />
      {size === "lg" && (
        <span className="mt-2 text-xs tracking-widest text-[var(--muted-foreground)] uppercase">
          Wir erstatten jeden 10. Kauf
        </span>
      )}
    </span>
  );
}
