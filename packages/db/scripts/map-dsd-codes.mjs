/**
 * Map DB products to DSD product codes (E9 Key-Delivery prerequisite).
 *
 * Strategy: fuzzy match by brand + numberOfUsers + yearsValid + licenceType.
 * Only writes "high confidence" matches (exact brand + user count + year match).
 * Logs ambiguous or unmatched products for manual review.
 *
 * Run: cd packages/db && node scripts/map-dsd-codes.mjs [--apply]
 *   --apply : actually write to DB; otherwise dry-run
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const DSD_CATALOG = "/tmp/dsd_full_catalog.json";
const APPLY = process.argv.includes("--apply");

if (!fs.existsSync(DSD_CATALOG)) {
  console.error(`Missing ${DSD_CATALOG}. Fetch from Hetzner first.`);
  process.exit(1);
}

const dsdProducts = JSON.parse(fs.readFileSync(DSD_CATALOG, "utf8"));

/** Parse user count + years from product name, e.g. "3 PC 1 Jahr" → {users:3, years:1} */
function parseSpec(name) {
  const lower = name.toLowerCase();
  let users = null;
  let years = null;
  const userMatch = lower.match(/(\d+)\s*(?:-|\s)?(?:pc|device|ger(?:ä|a)te?|user|mac|gerat)s?\b/);
  if (userMatch) users = parseInt(userMatch[1], 10);
  if (/unlimited|unbegrenzt/.test(lower)) users = 999;
  const yearMatch = lower.match(/(\d+)\s*(?:jahr|year)/);
  if (yearMatch) years = parseInt(yearMatch[1], 10);
  return { users, years };
}

/** Normalize brand for comparison */
function normBrand(b) {
  return (b || "").toLowerCase().replace(/[™®]/g, "").replace(/\s+/g, "").trim();
}

/** Normalize product type keyword */
function productType(name) {
  const l = name.toLowerCase();
  if (/total\s*protection/.test(l)) return "totalprotection";
  if (/internet\s*security/.test(l)) return "internetsecurity";
  if (/total\s*security/.test(l)) return "totalsecurity";
  if (/premium\s*security/.test(l)) return "premiumsecurity";
  if (/\b360\b.*premium/.test(l)) return "360premium";
  if (/\b360\b.*deluxe/.test(l)) return "360deluxe";
  if (/\b360\b.*standard/.test(l)) return "360standard";
  if (/tune\s*up/.test(l)) return "tuneup";
  if (/antivirus\s*plus/.test(l)) return "avplus";
  if (/anti\s*track/.test(l)) return "antitrack";
  if (/\bvpn\b/.test(l)) return "vpn";
  if (/safe\s*kids/.test(l)) return "safekids";
  if (/\bsafe\b/.test(l)) return "safe";
  if (/ultimate/.test(l)) return "ultimate";
  if (/fine\s*reader/.test(l)) return "finereader";
  if (/nod32/.test(l)) return "nod32";
  if (/smart\s*security/.test(l)) return "smartsecurity";
  if (/family\s*pack/.test(l)) return "familypack";
  if (/dome\s*complete/.test(l)) return "domecomplete";
  if (/dome\s*advanced/.test(l)) return "domeadvanced";
  if (/dome\s*essential/.test(l)) return "domeessential";
  if (/dome/.test(l)) return "dome";
  if (/antivirus/.test(l)) return "antivirus";
  if (/cyber\s*protect/.test(l)) return "cyberprotect";
  return "other";
}

function isOem(name) {
  return /\boem\b/i.test(name);
}

function isSubscription(name) {
  return /subscription/i.test(name) && !/non[-\s]?subscription/i.test(name);
}

const prisma = new PrismaClient();
const dbProducts = await prisma.product.findMany({
  orderBy: [{ brand: "asc" }, { sellPrice: "asc" }],
});

const results = [];
for (const p of dbProducts) {
  const { users: dbUsers, years: dbYears } = parseSpec(p.name);
  const dbType = productType(p.name);
  const dbBrand = normBrand(p.brand);
  const dbOem = isOem(p.name);

  const candidates = [];
  for (const d of dsdProducts) {
    const dBrand = normBrand(d.brandName);
    if (dBrand !== dbBrand && !(dbBrand === "panda" && dBrand === "pandasecurity")) continue;

    // Parse from name first (DSD numberOfUsers field is unreliable — e.g.
    // DSD260010 has numberOfUsers="1" but name says "3-PC"). Use the name.
    const dName = d.name || d.nameDefault || "";
    const { users: dUsersName, years: dYearsName } = parseSpec(dName);
    const dUsers = dUsersName ?? (parseInt(d.numberOfUsers || "0", 10) || null);
    const dYears = dYearsName ?? (parseInt(d.yearsValid || "0", 10) || null);
    const dType = productType(dName);
    const dOem = isOem(dName);
    const dSub = isSubscription(dName);

    let score = 0;
    let hardMatch = true;
    // Hard constraints (MUST match for high confidence)
    if (dbUsers !== null && dUsers !== null) {
      if (dUsers === dbUsers) score += 40;
      else hardMatch = false;
    }
    if (dbYears !== null && dYears !== null) {
      if (dYears === dbYears) score += 30;
      else hardMatch = false;
    }
    if (dType !== "other" && dbType !== "other") {
      if (dType === dbType) score += 50;
      else hardMatch = false;
    }
    // Soft preferences
    if (dOem === dbOem) score += 5;
    else hardMatch = false; // OEM vs retail are different SKUs — customer might get wrong key
    if (!dSub) score += 3;
    const stock = parseInt(d.stock || "0", 10) || 0;
    if (stock > 5) score += 3;

    candidates.push({ score, hardMatch, dsd: d });
  }

  candidates.sort((a, b) => (b.hardMatch - a.hardMatch) || (b.score - a.score));
  const top = candidates[0];
  const confidence =
    top && top.hardMatch && top.score >= 120 ? "high" :
    top && top.score >= 80 ? "medium" :
    top && top.score > 0 ? "low" : "none";

  results.push({
    sku: p.sku,
    name: p.name,
    dbBrand: p.brand,
    dbUsers,
    dbYears,
    dbType,
    top: top ? { score: top.score, code: top.dsd.productCode, name: top.dsd.name, stock: top.dsd.stock, ek: top.dsd.acquisitionPrice } : null,
    confidence,
    alternatives: candidates.slice(1, 3).map(c => ({ score: c.score, code: c.dsd.productCode, name: c.dsd.name })),
  });
}

// Report
let high = 0, medium = 0, low = 0, none = 0;
for (const r of results) {
  if (r.confidence === "high") high++;
  else if (r.confidence === "medium") medium++;
  else if (r.confidence === "low") low++;
  else none++;
}

console.log(`\n=== Mapping Report (${results.length} DB products) ===`);
console.log(`  HIGH confidence:   ${high}  ← will be written`);
console.log(`  MEDIUM confidence: ${medium}  ← requires manual review`);
console.log(`  LOW confidence:    ${low}`);
console.log(`  NO match:          ${none}\n`);

console.log("=== HIGH confidence matches ===");
for (const r of results.filter(r => r.confidence === "high")) {
  console.log(`  ${r.sku.padEnd(32)} → ${r.top.code.padEnd(12)} (€${r.top.ek}, stock ${r.top.stock}) | ${r.top.name.slice(0, 60)}`);
}

console.log("\n=== MEDIUM confidence (review needed) ===");
for (const r of results.filter(r => r.confidence === "medium").slice(0, 30)) {
  console.log(`  ${r.sku.padEnd(32)} → ${r.top.code.padEnd(12)} (score ${r.top.score}) | ${r.top.name.slice(0, 50)}`);
}

console.log("\n=== NO match ===");
for (const r of results.filter(r => r.confidence === "none")) {
  console.log(`  ${r.sku.padEnd(32)} | ${r.name.slice(0, 60)}`);
}

if (APPLY) {
  let updated = 0;
  for (const r of results.filter(r => r.confidence === "high")) {
    await prisma.product.update({
      where: { sku: r.sku },
      data: { dsdProductCode: r.top.code },
    });
    updated++;
  }
  console.log(`\n✅ Updated ${updated} products with DSD codes.`);
} else {
  console.log("\n(Dry-run — use --apply to write to DB)");
}

await prisma.$disconnect();
