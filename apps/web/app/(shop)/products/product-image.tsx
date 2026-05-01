/**
 * Apple-style product visual.
 *
 * Design goals:
 * - One consistent treatment for every product, whether we have a real
 *   packshot, a brand SVG, or nothing at all. The catalog mixes 41 remote
 *   DSD packshots, 14 local SVGs, and 8 products with no image — without
 *   a unified container they look like a thrift store.
 * - Neutral light tile (`#f5f5f7`) like apple.com/shop/buy-iphone — it
 *   neutralizes both crisp SVGs and slightly soft DSD PNGs.
 * - Center via `object-contain`; never crop or stretch, never apply a
 *   colored gradient (that's the previous "boxshot" trying too hard).
 * - When no image exists, render a typographic mark on the same tile so
 *   the grid stays visually rhythmic.
 */

import Image from "next/image";

const CATEGORY_LABELS: Record<string, string> = {
  Antivirus: "Antivirus",
  "Internet Security": "Internet Security",
  "Total Security": "Total Security",
  Office: "Office",
  Windows: "Windows",
  Betriebssystem: "Windows",
  VPN: "VPN",
  Utilities: "Utilities",
  Backup: "Backup",
  Mac: "Mac",
};

function parseProductMeta(name: string): { devices?: string; duration?: string; edition?: string } {
  const devices = name.match(/(\d+)\s*(?:Geräte?|PC|Dev|Mac)/i)?.[1];
  const unlimited = /Unbegrenzt/i.test(name);
  const duration = name.match(/(\d+)\s*Jahr/i)?.[1];

  let edition = "";
  if (/Premium|Family Pack/i.test(name)) edition = "Premium";
  else if (/Deluxe|Total Security|Total Protection|LiveSafe|Maximum|Complete|Pro\b/i.test(name)) edition = "Pro";
  else if (/Standard|Plus|Advanced|Essential|Home/i.test(name)) edition = "Standard";
  else if (/Internet Security/i.test(name)) edition = "Internet Security";

  return {
    devices: unlimited ? "∞" : devices,
    duration: duration ? `${duration} ${Number(duration) === 1 ? "Jahr" : "Jahre"}` : undefined,
    edition: edition || undefined,
  };
}

export function ProductImage({
  name,
  brand,
  category,
  imageUrl,
  size = "card",
}: {
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  /** "card" for grid tiles, "hero" for detail page (square 1:1, larger). */
  size?: "card" | "hero";
}) {
  const aspect = size === "hero" ? "aspect-square" : "aspect-[4/3]";

  // Real artwork (remote DSD packshot or local SVG) → contain on neutral tile.
  if (imageUrl) {
    const isRemote = imageUrl.startsWith("http");
    return (
      <div
        className={`relative ${aspect} w-full overflow-hidden rounded-2xl bg-[var(--tile)] flex items-center justify-center`}
      >
        {isRemote ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes={size === "hero" ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            className="object-contain p-8"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="max-h-full max-w-full object-contain p-8"
          />
        )}
      </div>
    );
  }

  // No artwork → typographic mark on the same neutral tile.
  // Centered brand wordmark + small edition + spec line beneath. No
  // gradients, no emoji logos — Apple-style restraint.
  const meta = parseProductMeta(name);
  const wordmark = (brand ?? "Software").toString();

  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden rounded-2xl bg-[var(--tile)] flex items-center justify-center select-none`}
    >
      <div className="flex flex-col items-center justify-center text-center px-6">
        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {wordmark}
        </p>
        {meta.edition && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {meta.edition}
          </p>
        )}
        {(meta.devices || meta.duration) && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            {[
              meta.devices === "∞" ? "Unbegrenzt" : meta.devices ? `${meta.devices} ${Number(meta.devices) === 1 ? "Gerät" : "Geräte"}` : null,
              meta.duration,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {category && !meta.edition && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {CATEGORY_LABELS[category] ?? category}
          </p>
        )}
      </div>
    </div>
  );
}

export function getCategoryLabel(category: string | null): string {
  if (!category) return "Software";
  return CATEGORY_LABELS[category] ?? category;
}
