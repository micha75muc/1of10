/**
 * Brand-specific visual styling for product cards.
 * Uses brand colors and icons to create recognizable product visuals
 * without requiring copyrighted product images.
 */

type BrandStyle = {
  gradient: string;
  icon: string;
  textColor: string;
  label: string;
};

const BRAND_STYLES: Record<string, BrandStyle> = {
  McAfee: {
    gradient: "from-red-600 to-red-900",
    icon: "M",
    textColor: "text-red-400",
    label: "McAfee",
  },
  Norton: {
    gradient: "from-yellow-500 to-yellow-700",
    icon: "🛡",
    textColor: "text-yellow-400",
    label: "Norton",
  },
  Bitdefender: {
    gradient: "from-red-500 to-rose-800",
    icon: "B",
    textColor: "text-red-400",
    label: "Bitdefender",
  },
  Kaspersky: {
    gradient: "from-emerald-500 to-emerald-800",
    icon: "K",
    textColor: "text-emerald-400",
    label: "Kaspersky",
  },
  AVG: {
    gradient: "from-green-500 to-green-800",
    icon: "AVG",
    textColor: "text-green-400",
    label: "AVG",
  },
  Avast: {
    gradient: "from-orange-500 to-orange-800",
    icon: "A",
    textColor: "text-orange-400",
    label: "Avast",
  },
  Acronis: {
    gradient: "from-blue-500 to-blue-800",
    icon: "A",
    textColor: "text-blue-400",
    label: "Acronis",
  },
  Panda: {
    gradient: "from-cyan-500 to-cyan-800",
    icon: "🐼",
    textColor: "text-cyan-400",
    label: "Panda",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  VPN: "🔒 VPN",
  Sicherheit: "🛡️ Sicherheit",
  "Backup & Utility": "💾 Backup",
  "Kreativ-Software": "🎨 Kreativ",
  Produktivität: "📊 Produktivität",
};

function getProductIcon(name: string, brand: string | null): string {
  if (name.includes("NordVPN")) return "N";
  if (name.includes("Norton")) return "🛡";
  if (name.includes("Bitdefender")) return "B";
  if (name.includes("Kaspersky")) return "K";
  if (name.includes("McAfee")) return "M";
  if (name.includes("Acronis")) return "A";
  if (name.includes("AOMEI")) return "AO";
  if (name.includes("Affinity Photo")) return "Ap";
  if (name.includes("Affinity Designer")) return "Ad";
  if (name.includes("Nitro")) return "N";
  return brand?.charAt(0) ?? "?";
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
  // If a real image URL is provided, use it
  if (imageUrl) {
    return (
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Brand-styled visual
  const style = BRAND_STYLES[brand ?? ""] ?? {
    gradient: "from-slate-600 to-slate-800",
    icon: "📦",
    textColor: "text-slate-400",
    label: brand ?? "Software",
  };

  const productIcon = getProductIcon(name, brand);

  return (
    <div
      className={`relative mb-4 flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${style.gradient} p-4`}
    >
      {/* Brand Icon */}
      <span className="mb-2 text-5xl font-black text-white/90 select-none leading-none">
        {productIcon}
      </span>
      {/* Brand Label */}
      <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
        {style.label}
      </span>
      {/* Category Badge */}
      {category && (
        <span className="absolute bottom-3 right-3 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-sm">
          {CATEGORY_LABELS[category] ?? category}
        </span>
      )}
    </div>
  );
}

export function getCategoryLabel(category: string | null): string {
  if (!category) return "Software";
  return CATEGORY_LABELS[category] ?? category;
}
