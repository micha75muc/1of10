#!/usr/bin/env node
/**
 * Uwe (UI): Generate high-quality PNG product boxshots using Sharp.
 * Creates professional 3D software box renders with brand colors.
 * 
 * Each boxshot is a 600x450 PNG with:
 * - 3D box perspective (front + side + top faces)
 * - Brand gradient colors
 * - Product edition text
 * - Device/duration specs
 * - Subtle shadow and lighting effects
 * 
 * Usage: node scripts/generate-png-boxshots.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "apps", "web", "public", "products");
const W = 600, H = 450;

const brands = {
  Norton:       { c1: "#FFB800", c2: "#E5A600", c3: "#B38200", side: "#997000", top: "#FFD24D", text: "#1a1100", shield: "🛡" },
  McAfee:       { c1: "#C8102E", c2: "#A00D24", c3: "#7A0A1C", side: "#5C0715", top: "#E0394F", text: "#ffffff", shield: "M" },
  Bitdefender:  { c1: "#ED1C24", c2: "#CC1820", c3: "#99121A", side: "#6B0D12", top: "#F45058", text: "#ffffff", shield: "BD" },
  "Trend Micro":{ c1: "#D71920", c2: "#B5151B", c3: "#8A1015", side: "#660C10", top: "#E54248", text: "#ffffff", shield: "TM" },
  Panda:        { c1: "#00B4D8", c2: "#009AB8", c3: "#007A93", side: "#005B6E", top: "#33C7E3", text: "#ffffff", shield: "🐼" },
  "F-Secure":   { c1: "#4361EE", c2: "#3854D4", c3: "#2C43AA", side: "#213280", top: "#6B82F2", text: "#ffffff", shield: "FS" },
  Microsoft:    { c1: "#0078D4", c2: "#0066B5", c3: "#004E8C", side: "#003966", top: "#3399E0", text: "#ffffff", shield: "⊞" },
  Parallels:    { c1: "#EF3B2D", c2: "#D03427", c3: "#A22A1F", side: "#7A2018", top: "#F26559", text: "#ffffff", shield: "∥" },
};

const products = [
  { sku: "NORTON-360-STD-1Y", brand: "Norton", line1: "360", line2: "Standard", sub: "1 Gerät · 1 Jahr" },
  { sku: "NORTON-360-DLX-3D-1Y", brand: "Norton", line1: "360", line2: "Deluxe", sub: "3 Geräte · 1 Jahr" },
  { sku: "NORTON-360-DLX-5D-1Y", brand: "Norton", line1: "360", line2: "Deluxe", sub: "5 Geräte · 1 Jahr" },
  { sku: "NORTON-360-PREM-10D-1Y", brand: "Norton", line1: "360", line2: "Premium", sub: "10 Geräte · 1 Jahr" },
  { sku: "MCAFEE-IS-1PC-1Y", brand: "McAfee", line1: "Internet", line2: "Security", sub: "1 PC · 1 Jahr" },
  { sku: "MCAFEE-IS-3PC-1Y", brand: "McAfee", line1: "Internet", line2: "Security", sub: "3 PC · 1 Jahr" },
  { sku: "MCAFEE-IS-10D-1Y", brand: "McAfee", line1: "Internet", line2: "Security", sub: "10 Geräte · 1 Jahr" },
  { sku: "MCAFEE-TP-1PC-1Y", brand: "McAfee", line1: "Total", line2: "Protection", sub: "1 PC · 1 Jahr" },
  { sku: "MCAFEE-TP-10PC-1Y", brand: "McAfee", line1: "Total", line2: "Protection", sub: "10 PC · 1 Jahr" },
  { sku: "MCAFEE-LIVESAFE-UNL-1Y", brand: "McAfee", line1: "Live", line2: "Safe", sub: "Unbegrenzt · 1 Jahr" },
  { sku: "TREND-IS-1PC-1Y", brand: "Trend Micro", line1: "Internet", line2: "Security", sub: "1 PC · 1 Jahr" },
  { sku: "TREND-IS-3PC-1Y", brand: "Trend Micro", line1: "Internet", line2: "Security", sub: "3 PC · 1 Jahr" },
  { sku: "TREND-IS-5PC-2Y", brand: "Trend Micro", line1: "Internet", line2: "Security", sub: "5 PC · 2 Jahre" },
  { sku: "TREND-MAXSEC-5PC-1Y", brand: "Trend Micro", line1: "Maximum", line2: "Security", sub: "5 PC · 1 Jahr" },
  { sku: "TREND-MAXSEC-3PC-2Y", brand: "Trend Micro", line1: "Maximum", line2: "Security", sub: "3 PC · 2 Jahre" },
  { sku: "TREND-MAXSEC-5PC-2Y", brand: "Trend Micro", line1: "Maximum", line2: "Security", sub: "5 PC · 2 Jahre" },
  { sku: "TREND-MAXSEC-3PC-3Y", brand: "Trend Micro", line1: "Maximum", line2: "Security", sub: "3 PC · 3 Jahre" },
  { sku: "TREND-MAXSEC-5PC-3Y", brand: "Trend Micro", line1: "Maximum", line2: "Security", sub: "5 PC · 3 Jahre" },
  { sku: "BITDEF-AV-1PC-1Y", brand: "Bitdefender", line1: "Antivirus", line2: "Plus", sub: "1 PC · 1 Jahr" },
  { sku: "BITDEF-AV-3PC-1Y", brand: "Bitdefender", line1: "Antivirus", line2: "Plus", sub: "3 PC · 1 Jahr" },
  { sku: "BITDEF-IS-5PC-1Y", brand: "Bitdefender", line1: "Internet", line2: "Security", sub: "5 PC · 1 Jahr" },
  { sku: "BITDEF-TS-5D-1Y", brand: "Bitdefender", line1: "Total", line2: "Security", sub: "5 Geräte · 1 Jahr" },
  { sku: "BITDEF-TS-10D-1Y", brand: "Bitdefender", line1: "Total", line2: "Security", sub: "10 Geräte · 1 Jahr" },
  { sku: "BITDEF-TS-10D-2Y", brand: "Bitdefender", line1: "Total", line2: "Security", sub: "10 Geräte · 2 Jahre" },
  { sku: "BITDEF-FAMILY-15D-1Y", brand: "Bitdefender", line1: "Family", line2: "Pack", sub: "15 Geräte · 1 Jahr" },
  { sku: "PANDA-ADV-1PC-1Y", brand: "Panda", line1: "Dome", line2: "Advanced", sub: "1 PC · 1 Jahr" },
  { sku: "PANDA-ADV-3PC-1Y", brand: "Panda", line1: "Dome", line2: "Advanced", sub: "3 PC · 1 Jahr" },
  { sku: "PANDA-COMP-5PC-1Y", brand: "Panda", line1: "Dome", line2: "Complete", sub: "5 PC · 1 Jahr" },
  { sku: "FSEC-IS-1PC-1Y", brand: "F-Secure", line1: "Internet", line2: "Security", sub: "1 PC · 1 Jahr" },
  { sku: "FSEC-SAFE-3D-1Y", brand: "F-Secure", line1: "Safe", line2: "", sub: "3 Geräte · 1 Jahr" },
  { sku: "MS365-PERSONAL-1Y", brand: "Microsoft", line1: "365", line2: "Personal", sub: "1 Nutzer · 1 Jahr" },
  { sku: "MS365-FAMILY-1Y", brand: "Microsoft", line1: "365", line2: "Family", sub: "6 Nutzer · 1 Jahr" },
  { sku: "MS-OFFICE-HS-2021", brand: "Microsoft", line1: "Office", line2: "Home & Student", sub: "Dauerlizenz" },
  { sku: "MS-OFFICE-HB-2021", brand: "Microsoft", line1: "Office", line2: "Home & Business", sub: "Dauerlizenz" },
  { sku: "WIN11-HOME-OEM", brand: "Microsoft", line1: "Windows 11", line2: "Home", sub: "OEM-Lizenz" },
  { sku: "WIN11-PRO-OEM", brand: "Microsoft", line1: "Windows 11", line2: "Pro", sub: "OEM-Lizenz" },
  { sku: "PARALLELS-18-STD-1Y", brand: "Parallels", line1: "Desktop", line2: "18 Standard", sub: "1 Mac · 1 Jahr" },
];

function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function buildSvg(p) {
  const b = brands[p.brand] || brands.Microsoft;
  const brandUp = esc(p.brand.toUpperCase());
  const l1 = esc(p.line1);
  const l2 = esc(p.line2);
  const sub = esc(p.sub);

  // Box dimensions (3D perspective)
  const bx = 150, by = 50;       // Box top-left front
  const bw = 240, bh = 310;      // Front face size  
  const sd = 40;                  // Side/top depth

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8f9fa"/>
      <stop offset="100%" stop-color="#e9ecef"/>
    </linearGradient>
    <linearGradient id="front" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="${b.c1}"/>
      <stop offset="50%" stop-color="${b.c2}"/>
      <stop offset="100%" stop-color="${b.c3}"/>
    </linearGradient>
    <linearGradient id="side" x1="0" y1="0" x2="1" y2="0.5">
      <stop offset="0%" stop-color="${b.side}"/>
      <stop offset="100%" stop-color="${b.c3}"/>
    </linearGradient>
    <linearGradient id="top" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${b.top}"/>
      <stop offset="100%" stop-color="${b.c1}" stop-opacity="0.8"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="6" dy="12" stdDeviation="18" flood-color="#000" flood-opacity="0.2"/>
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)" rx="12"/>

  <!-- Subtle pattern -->
  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="10" cy="10" r="0.5" fill="#000" opacity="0.03"/>
  </pattern>
  <rect width="${W}" height="${H}" fill="url(#dots)" rx="12"/>

  <!-- 3D Software Box -->
  <g filter="url(#shadow)">
    <!-- Top face -->
    <polygon points="${bx},${by} ${bx+bw},${by} ${bx+bw+sd},${by-sd+10} ${bx+sd},${by-sd+10}" fill="url(#top)" opacity="0.85"/>

    <!-- Side face (right) -->
    <polygon points="${bx+bw},${by} ${bx+bw+sd},${by-sd+10} ${bx+bw+sd},${by+bh-sd+10} ${bx+bw},${by+bh}" fill="url(#side)"/>
    
    <!-- Front face -->
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#front)" rx="4"/>
    
    <!-- Accent stripe at top of front -->
    <rect x="${bx}" y="${by}" width="${bw}" height="6" fill="${b.top}" opacity="0.7" rx="4"/>
    <rect x="${bx}" y="${by+3}" width="${bw}" height="3" fill="${b.top}" opacity="0.7"/>

    <!-- Decorative circle (shield/logo area) -->
    <circle cx="${bx+bw/2}" cy="${by+95}" r="40" fill="white" opacity="0.08"/>
    <circle cx="${bx+bw/2}" cy="${by+95}" r="28" fill="white" opacity="0.06"/>

    <!-- Brand name -->
    <text x="${bx+bw/2}" y="${by+155}" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="15" font-weight="800" letter-spacing="3" fill="${b.text}" opacity="0.5">${brandUp}</text>

    <!-- Product line 1 (large) -->
    <text x="${bx+bw/2}" y="${by+195}" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="28" font-weight="700" fill="${b.text}" filter="url(#glow)">${l1}</text>
    
    <!-- Product line 2 -->
    <text x="${bx+bw/2}" y="${by+225}" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="22" font-weight="600" fill="${b.text}" opacity="0.9">${l2}</text>

    <!-- Separator line -->
    <rect x="${bx+70}" y="${by+240}" width="${bw-140}" height="1.5" fill="${b.text}" opacity="0.15" rx="1"/>

    <!-- Specs pill -->
    <rect x="${bx+50}" y="${by+255}" width="${bw-100}" height="30" rx="15" fill="white" opacity="0.15"/>
    <text x="${bx+bw/2}" y="${by+275}" text-anchor="middle" font-family="'Segoe UI',system-ui,sans-serif" font-size="13" font-weight="600" fill="${b.text}" opacity="0.85">${sub}</text>

    <!-- Bottom accent -->
    <rect x="${bx}" y="${by+bh-4}" width="${bw}" height="4" fill="${b.top}" opacity="0.5" rx="0"/>
    <rect x="${bx}" y="${by+bh-4}" width="${bw}" height="4" rx="4" fill="transparent"/>
  </g>

  <!-- Reflection hint on floor -->
  <ellipse cx="${bx+bw/2+sd/2}" cy="${by+bh+15}" rx="${bw/2+20}" ry="8" fill="${b.c2}" opacity="0.06"/>
</svg>`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let count = 0;
  for (const p of products) {
    const svg = buildSvg(p);
    const pngPath = path.join(OUT_DIR, `${p.sku}.png`);
    
    await sharp(Buffer.from(svg))
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(pngPath);
    
    const stats = fs.statSync(pngPath);
    count++;
    process.stdout.write(`\r  ${count}/${products.length} — ${p.sku} (${Math.round(stats.size/1024)}KB)`);
  }

  // Also keep SVGs as fallback but delete old ones
  console.log(`\n\n✅ ${count} PNG boxshots generated in ${OUT_DIR}`);
  
  // List file sizes
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png'));
  const totalSize = files.reduce((sum, f) => sum + fs.statSync(path.join(OUT_DIR, f)).size, 0);
  console.log(`   Total: ${files.length} PNGs, ${Math.round(totalSize/1024)}KB`);
}

main().catch(e => { console.error(e); process.exit(1); });
