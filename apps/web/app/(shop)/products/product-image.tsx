/**
 * Uwe (UI): Professional virtual boxshot product visuals.
 * Renders brand-colored product cards with name, device count,
 * duration, and brand logo — no copyrighted images needed.
 */

import Image from "next/image";

type BrandStyle = {
  bg: string;
  accent: string;
  text: string;
  label: string;
  logo: string;
};

const BRAND_STYLES: Record<string, BrandStyle> = {
  Norton: {
    bg: "from-yellow-500 via-amber-600 to-yellow-700",
    accent: "bg-yellow-400",
    text: "text-yellow-950",
    label: "NORTON",
    logo: "🛡️",
  },
  McAfee: {
    bg: "from-red-600 via-red-700 to-red-900",
    accent: "bg-red-400",
    text: "text-white",
    label: "McAfee",
    logo: "M",
  },
  Bitdefender: {
    bg: "from-red-500 via-rose-600 to-rose-800",
    accent: "bg-rose-300",
    text: "text-white",
    label: "BITDEFENDER",
    logo: "B",
  },
  "Trend Micro": {
    bg: "from-red-500 via-red-600 to-red-800",
    accent: "bg-red-300",
    text: "text-white",
    label: "TREND MICRO",
    logo: "TM",
  },
  Panda: {
    bg: "from-cyan-500 via-cyan-600 to-teal-700",
    accent: "bg-cyan-300",
    text: "text-white",
    label: "PANDA",
    logo: "🐼",
  },
  "F-Secure": {
    bg: "from-indigo-500 via-blue-600 to-indigo-800",
    accent: "bg-blue-300",
    text: "text-white",
    label: "F-SECURE",
    logo: "F",
  },
  Microsoft: {
    bg: "from-blue-600 via-blue-700 to-blue-900",
    accent: "bg-blue-400",
    text: "text-white",
    label: "MICROSOFT",
    logo: "⊞",
  },
  Parallels: {
    bg: "from-red-500 via-red-600 to-rose-800",
    accent: "bg-red-300",
    text: "text-white",
    label: "PARALLELS",
    logo: "∥",
  },
  AVG: {
    bg: "from-green-500 via-emerald-600 to-green-800",
    accent: "bg-green-300",
    text: "text-white",
    label: "AVG",
    logo: "A",
  },
  Avast: {
    bg: "from-orange-500 via-orange-600 to-amber-700",
    accent: "bg-orange-300",
    text: "text-white",
    label: "AVAST",
    logo: "A",
  },
  ESET: {
    bg: "from-teal-500 via-teal-600 to-cyan-800",
    accent: "bg-teal-300",
    text: "text-white",
    label: "ESET",
    logo: "E",
  },
  Kaspersky: {
    bg: "from-emerald-600 via-green-700 to-emerald-900",
    accent: "bg-emerald-400",
    text: "text-white",
    label: "KASPERSKY",
    logo: "K",
  },
  "G Data": {
    bg: "from-blue-500 via-blue-600 to-sky-800",
    accent: "bg-blue-300",
    text: "text-white",
    label: "G DATA",
    logo: "G",
  },
  Acronis: {
    bg: "from-blue-700 via-indigo-700 to-blue-900",
    accent: "bg-blue-400",
    text: "text-white",
    label: "ACRONIS",
    logo: "A",
  },
  ABBYY: {
    bg: "from-sky-600 via-blue-700 to-sky-900",
    accent: "bg-sky-300",
    text: "text-white",
    label: "ABBYY",
    logo: "A",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  Antivirus: "🛡️ Antivirus",
  "Internet Security": "🔒 Internet Security",
  "Total Security": "🏆 Total Security",
  Office: "💼 Office",
  Windows: "🖥️ Windows",
  Betriebssystem: "🖥️ Windows",
  VPN: "🌐 VPN",
  Utilities: "⚙️ Utilities",
  Backup: "💾 Backup",
  Mac: "🍎 Mac",
};

/** Parse product name to extract devices/duration for the boxshot */
function parseProductMeta(name: string): { devices?: string; duration?: string; edition?: string } {
  const devices = name.match(/(\d+)\s*(?:Geräte?|PC|Dev|Mac)/i)?.[1];
  const unlimited = /Unbegrenzt/i.test(name);
  const duration = name.match(/(\d+)\s*Jahr/i)?.[1];
  
  let edition = "";
  if (/Premium|Family Pack/i.test(name)) edition = "PREMIUM";
  else if (/Deluxe|Total Security|Total Protection|LiveSafe|Maximum|Complete|Pro\b/i.test(name)) edition = "PRO";
  else if (/Standard|Plus|Advanced|Essential|Home/i.test(name)) edition = "STANDARD";
  else if (/Internet Security/i.test(name)) edition = "INTERNET SECURITY";
  
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
}: {
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
}) {
  if (imageUrl) {
    const isLocal = imageUrl.startsWith("/products/");
    if (isLocal) {
      return (
        <div className="relative mb-4 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={name}
            width={600}
            height={450}
            className="w-full h-auto"
          />
        </div>
      );
    }
    return (
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
    );
  }

  const style = BRAND_STYLES[brand ?? ""] ?? {
    bg: "from-slate-600 via-slate-700 to-slate-800",
    accent: "bg-slate-400",
    text: "text-white",
    label: brand?.toUpperCase() ?? "SOFTWARE",
    logo: "📦",
  };

  const meta = parseProductMeta(name);

  return (
    <div
      className={`relative mb-4 flex aspect-[4/3] flex-col overflow-hidden rounded-xl bg-gradient-to-br ${style.bg} p-5 select-none`}
    >
      {/* Decorative shapes */}
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-black/10 to-transparent" />

      {/* Top: Brand logo + name */}
      <div className="relative z-10 flex items-center gap-2 mb-auto">
        <span className="text-2xl font-black text-white/80 leading-none">{style.logo}</span>
        <span className="text-xs font-bold tracking-[0.15em] text-white/60">{style.label}</span>
      </div>

      {/* Center: Edition name */}
      {meta.edition && (
        <div className="relative z-10 mb-2">
          <p className={`text-xl font-extrabold leading-tight ${style.text} drop-shadow-sm`}>
            {meta.edition}
          </p>
        </div>
      )}

      {/* Bottom: Specs pills */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5 mt-auto">
        {meta.devices && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
            {meta.devices === "∞" ? "Unbegrenzt" : `${meta.devices} ${Number(meta.devices) === 1 ? "Gerät" : "Geräte"}`}
          </span>
        )}
        {meta.duration && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            {meta.duration}
          </span>
        )}
        {category && (
          <span className="inline-flex items-center rounded-full bg-black/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white/70">
            {CATEGORY_LABELS[category] ?? category}
          </span>
        )}
      </div>
    </div>
  );
}

export function getCategoryLabel(category: string | null): string {
  if (!category) return "Software";
  return CATEGORY_LABELS[category] ?? category;
}
