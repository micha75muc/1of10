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
  Microsoft: {
    gradient: "from-blue-600 to-blue-800",
    icon: "⊞",
    textColor: "text-blue-400",
    label: "Microsoft",
  },
  Adobe: {
    gradient: "from-red-600 to-red-900",
    icon: "Cc",
    textColor: "text-red-400",
    label: "Adobe",
  },
  Norton: {
    gradient: "from-yellow-500 to-yellow-700",
    icon: "🛡",
    textColor: "text-yellow-400",
    label: "Norton",
  },
  Kaspersky: {
    gradient: "from-emerald-500 to-emerald-800",
    icon: "K",
    textColor: "text-emerald-400",
    label: "Kaspersky",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  Betriebssystem: "🪟 Betriebssystem",
  "Office & Produktivität": "📊 Office",
  "Kreativ-Software": "🎨 Kreativ",
  Sicherheit: "🛡️ Sicherheit",
  Server: "🖥️ Server",
};

function getProductIcon(name: string, brand: string | null): string {
  if (name.includes("Windows 11")) return "⊞ 11";
  if (name.includes("Windows Server")) return "⊞ SRV";
  if (name.includes("365")) return "365";
  if (name.includes("Office 2024")) return "⊞ 24";
  if (name.includes("Adobe")) return "Cc";
  if (name.includes("Norton")) return "N";
  if (name.includes("Kaspersky")) return "K";
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
