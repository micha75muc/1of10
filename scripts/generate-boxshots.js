#!/usr/bin/env node
/**
 * Uwe (UI): Generate professional SVG boxshot product images.
 * Creates 3D-perspective software box visuals with brand colors.
 * Usage: node scripts/generate-boxshots.js
 */

const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "apps", "web", "public", "products");

const brands = {
  Norton: { bg1: "#FFB800", bg2: "#CC8800", accent: "#000000", textColor: "#000" },
  McAfee: { bg1: "#C8102E", bg2: "#8B0000", accent: "#FF4444", textColor: "#fff" },
  Bitdefender: { bg1: "#ED1C24", bg2: "#8B0015", accent: "#FF6B6B", textColor: "#fff" },
  "Trend Micro": { bg1: "#D71920", bg2: "#8B0000", accent: "#FF5252", textColor: "#fff" },
  Panda: { bg1: "#00B4D8", bg2: "#0077B6", accent: "#90E0EF", textColor: "#fff" },
  "F-Secure": { bg1: "#4A6CF7", bg2: "#2D3A8C", accent: "#7B8FF7", textColor: "#fff" },
  Microsoft: { bg1: "#0078D4", bg2: "#003A6B", accent: "#50A0E0", textColor: "#fff" },
  Parallels: { bg1: "#EF3B2D", bg2: "#9B1B12", accent: "#FF6B5E", textColor: "#fff" },
};

const products = [
  { sku: "NORTON-360-STD-1Y", brand: "Norton", edition: "360 Standard", sub: "1 Gerät · 1 Jahr" },
  { sku: "NORTON-360-DLX-3D-1Y", brand: "Norton", edition: "360 Deluxe", sub: "3 Geräte · 1 Jahr" },
  { sku: "NORTON-360-DLX-5D-1Y", brand: "Norton", edition: "360 Deluxe", sub: "5 Geräte · 1 Jahr" },
  { sku: "NORTON-360-PREM-10D-1Y", brand: "Norton", edition: "360 Premium", sub: "10 Geräte · 1 Jahr" },
  { sku: "MCAFEE-IS-1PC-1Y", brand: "McAfee", edition: "Internet Security", sub: "1 PC · 1 Jahr" },
  { sku: "MCAFEE-IS-3PC-1Y", brand: "McAfee", edition: "Internet Security", sub: "3 PC · 1 Jahr" },
  { sku: "MCAFEE-IS-10D-1Y", brand: "McAfee", edition: "Internet Security", sub: "10 Geräte · 1 Jahr" },
  { sku: "MCAFEE-TP-1PC-1Y", brand: "McAfee", edition: "Total Protection", sub: "1 PC · 1 Jahr" },
  { sku: "MCAFEE-TP-10PC-1Y", brand: "McAfee", edition: "Total Protection", sub: "10 PC · 1 Jahr" },
  { sku: "MCAFEE-LIVESAFE-UNL-1Y", brand: "McAfee", edition: "LiveSafe", sub: "Unbegrenzt · 1 Jahr" },
  { sku: "TREND-IS-1PC-1Y", brand: "Trend Micro", edition: "Internet Security", sub: "1 PC · 1 Jahr" },
  { sku: "TREND-IS-3PC-1Y", brand: "Trend Micro", edition: "Internet Security", sub: "3 PC · 1 Jahr" },
  { sku: "TREND-IS-5PC-2Y", brand: "Trend Micro", edition: "Internet Security", sub: "5 PC · 2 Jahre" },
  { sku: "TREND-MAXSEC-5PC-1Y", brand: "Trend Micro", edition: "Maximum Security", sub: "5 PC · 1 Jahr" },
  { sku: "TREND-MAXSEC-3PC-2Y", brand: "Trend Micro", edition: "Maximum Security", sub: "3 PC · 2 Jahre" },
  { sku: "TREND-MAXSEC-5PC-2Y", brand: "Trend Micro", edition: "Maximum Security", sub: "5 PC · 2 Jahre" },
  { sku: "TREND-MAXSEC-3PC-3Y", brand: "Trend Micro", edition: "Maximum Security", sub: "3 PC · 3 Jahre" },
  { sku: "TREND-MAXSEC-5PC-3Y", brand: "Trend Micro", edition: "Maximum Security", sub: "5 PC · 3 Jahre" },
  { sku: "BITDEF-AV-1PC-1Y", brand: "Bitdefender", edition: "Antivirus Plus", sub: "1 PC · 1 Jahr" },
  { sku: "BITDEF-AV-3PC-1Y", brand: "Bitdefender", edition: "Antivirus Plus", sub: "3 PC · 1 Jahr" },
  { sku: "BITDEF-IS-5PC-1Y", brand: "Bitdefender", edition: "Internet Security", sub: "5 PC · 1 Jahr" },
  { sku: "BITDEF-TS-5D-1Y", brand: "Bitdefender", edition: "Total Security", sub: "5 Geräte · 1 Jahr" },
  { sku: "BITDEF-TS-10D-1Y", brand: "Bitdefender", edition: "Total Security", sub: "10 Geräte · 1 Jahr" },
  { sku: "BITDEF-TS-10D-2Y", brand: "Bitdefender", edition: "Total Security", sub: "10 Geräte · 2 Jahre" },
  { sku: "BITDEF-FAMILY-15D-1Y", brand: "Bitdefender", edition: "Family Pack", sub: "15 Geräte · 1 Jahr" },
  { sku: "PANDA-ADV-1PC-1Y", brand: "Panda", edition: "Dome Advanced", sub: "1 PC · 1 Jahr" },
  { sku: "PANDA-ADV-3PC-1Y", brand: "Panda", edition: "Dome Advanced", sub: "3 PC · 1 Jahr" },
  { sku: "PANDA-COMP-5PC-1Y", brand: "Panda", edition: "Dome Complete", sub: "5 PC · 1 Jahr" },
  { sku: "FSEC-IS-1PC-1Y", brand: "F-Secure", edition: "Internet Security", sub: "1 PC · 1 Jahr" },
  { sku: "FSEC-SAFE-3D-1Y", brand: "F-Secure", edition: "Safe", sub: "3 Geräte · 1 Jahr" },
  { sku: "MS365-PERSONAL-1Y", brand: "Microsoft", edition: "365 Personal", sub: "1 Nutzer · 1 Jahr" },
  { sku: "MS365-FAMILY-1Y", brand: "Microsoft", edition: "365 Family", sub: "6 Nutzer · 1 Jahr" },
  { sku: "MS-OFFICE-HS-2021", brand: "Microsoft", edition: "Office Home & Student", sub: "Dauerlizenz" },
  { sku: "MS-OFFICE-HB-2021", brand: "Microsoft", edition: "Office Home & Business", sub: "Dauerlizenz" },
  { sku: "WIN11-HOME-OEM", brand: "Microsoft", edition: "Windows 11 Home", sub: "OEM · Dauerlizenz" },
  { sku: "WIN11-PRO-OEM", brand: "Microsoft", edition: "Windows 11 Pro", sub: "OEM · Dauerlizenz" },
  { sku: "PARALLELS-18-STD-1Y", brand: "Parallels", edition: "Desktop 18", sub: "1 Mac · 1 Jahr" },
];

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateBoxshot(product) {
  const b = brands[product.brand] || brands.Microsoft;
  const edition = escapeXml(product.edition);
  const brandName = escapeXml(product.brand);
  const sub = escapeXml(product.sub);
  
  // Dynamic font size for long edition names (e.g. "Office Home & Business")
  const edFS = edition.length > 20 ? 11 : edition.length > 16 ? 13 : 16;
  // Split long editions into 2 lines
  let edLine1 = edition, edLine2 = "";
  if (edition.length > 16) {
    const words = edition.split(" ");
    const mid = Math.ceil(words.length / 2);
    edLine1 = words.slice(0, mid).join(" ");
    edLine2 = words.slice(mid).join(" ");
  }
  // Dynamic sub pill width
  const subW = Math.min(150, Math.max(90, sub.length * 6.5 + 16));
  const subFS = sub.length > 18 ? 9 : 11;
  
  // 3D box perspective with front face + side face + top face
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="front-${product.sku}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${b.bg1}"/>
      <stop offset="100%" style="stop-color:${b.bg2}"/>
    </linearGradient>
    <linearGradient id="side-${product.sku}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${b.bg2}"/>
      <stop offset="100%" style="stop-color:${b.bg2};stop-opacity:0.6"/>
    </linearGradient>
    <linearGradient id="top-${product.sku}" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:${b.bg1}"/>
      <stop offset="100%" style="stop-color:${b.bg1};stop-opacity:0.7"/>
    </linearGradient>
    <filter id="shadow-${product.sku}">
      <feDropShadow dx="4" dy="8" stdDeviation="12" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="300" fill="#f5f5f7" rx="12"/>
  
  <!-- 3D Box -->
  <g filter="url(#shadow-${product.sku})" transform="translate(95, 25)">
    <!-- Side face (right) -->
    <polygon points="180,20 210,8 210,228 180,240" fill="url(#side-${product.sku})"/>
    
    <!-- Top face -->
    <polygon points="10,20 180,20 210,8 40,8" fill="url(#top-${product.sku})" opacity="0.8"/>
    
    <!-- Front face -->
    <rect x="10" y="20" width="170" height="220" rx="3" fill="url(#front-${product.sku})"/>
    
    <!-- Decorative line on front -->
    <rect x="10" y="20" width="170" height="4" fill="${b.accent}" opacity="0.6" rx="1"/>
    
    <!-- Shield/icon circle -->
    <circle cx="95" cy="95" r="28" fill="white" opacity="0.15"/>
    <circle cx="95" cy="95" r="20" fill="white" opacity="0.1"/>
    
    <!-- Brand name -->
    <text x="95" y="148" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="13" font-weight="800" letter-spacing="2" fill="${b.textColor}" opacity="0.7">${brandName.toUpperCase()}</text>
    
    <!-- Edition name (auto-wrapped for long names) -->
    <text x="95" y="${edLine2 ? 168 : 175}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${edFS}" font-weight="700" fill="${b.textColor}">${edLine1}</text>
    ${edLine2 ? `<text x="95" y="${168 + edFS + 4}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${edFS}" font-weight="700" fill="${b.textColor}">${edLine2}</text>` : ""}
    
    <!-- Sub info (devices/duration) -->
    <rect x="${95 - subW/2}" y="195" width="${subW}" height="24" rx="12" fill="white" opacity="0.2"/>
    <text x="95" y="212" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${subFS}" font-weight="600" fill="${b.textColor}">${sub}</text>
  </g>
</svg>`;
}

// Generate all boxshots
fs.mkdirSync(OUT_DIR, { recursive: true });

let count = 0;
for (const p of products) {
  const svg = generateBoxshot(p);
  const filename = `${p.sku}.svg`;
  fs.writeFileSync(path.join(OUT_DIR, filename), svg);
  count++;
}

console.log(`✅ ${count} SVG boxshots generated in ${OUT_DIR}`);
