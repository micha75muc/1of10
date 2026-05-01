// Auto-match DB-SKU → DSD-Code by brand + costPrice tolerance.
// Produces apps/web/lib/dsd-mappings.generated.ts plus a console report.
//
// Run: node scripts/generate-dsd-mapping.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

// --- DSD-Katalog (EK netto, NL-MwSt 21%) ---
const dsd = [
  // G Data
  { sku: "C2001ESD12001", brand: "G Data", ekNetto: 18.088 },
  { sku: "C2001ESD24001", brand: "G Data", ekNetto: 27.709 },
  { sku: "C2001ESD12003", brand: "G Data", ekNetto: 27.709 },
  { sku: "C2001ESD24003", brand: "G Data", ekNetto: 43.028 },
  { sku: "C2001ESD12005", brand: "G Data", ekNetto: 36.176 },
  { sku: "C2001ESD24005", brand: "G Data", ekNetto: 55.435 },
  { sku: "C2001ESD12010", brand: "G Data", ekNetto: 57.741 },
  { sku: "C2002ESD12001", brand: "G Data", ekNetto: 27.709 },
  { sku: "C2002ESD24001", brand: "G Data", ekNetto: 41.876 },
  { sku: "C2002ESD12003", brand: "G Data", ekNetto: 36.176 },
  { sku: "C2002ESD24003", brand: "G Data", ekNetto: 53.666 },
  { sku: "C2002ESD12005", brand: "G Data", ekNetto: 45.797 },
  { sku: "C2002ESD24005", brand: "G Data", ekNetto: 68.426 },
  { sku: "C2003ESD12001", brand: "G Data", ekNetto: 36.176 },
  { sku: "C2003ESD24001", brand: "G Data", ekNetto: 53.666 },
  { sku: "C2003ESD12003", brand: "G Data", ekNetto: 45.797 },
  { sku: "C2003ESD24003", brand: "G Data", ekNetto: 68.426 },
  { sku: "C2003ESD12005", brand: "G Data", ekNetto: 53.666 },
  { sku: "C2003ESD24005", brand: "G Data", ekNetto: 80.261 },
  { sku: "C2003ESD12010", brand: "G Data", ekNetto: 86.978 },
  { sku: "C2004ESD12001", brand: "G Data", ekNetto: 27.709 },
  { sku: "C2004ESD24001", brand: "G Data", ekNetto: 43.028 },
  { sku: "C2004ESD12005", brand: "G Data", ekNetto: 53.666 },
  // Kaspersky
  { sku: "DSD101007", brand: "Kaspersky", ekNetto: 57.531 },
  { sku: "DSD101009", brand: "Kaspersky", ekNetto: 10.90 },
  // ESET
  { sku: "DSD110190", brand: "ESET", ekNetto: 18.459 },
  { sku: "DSD110196", brand: "ESET", ekNetto: 27.959 },
  { sku: "DSD110198", brand: "ESET", ekNetto: 34.159 },
  { sku: "DSD111113", brand: "ESET", ekNetto: 40.505 },
  { sku: "DSD111121", brand: "ESET", ekNetto: 65.175 },
  { sku: "DSD111122", brand: "ESET", ekNetto: 40.925 },
  { sku: "DSD111120", brand: "ESET", ekNetto: 43.375 },
  { sku: "DSD111125", brand: "ESET", ekNetto: 101.67 },
  { sku: "DSD111126", brand: "ESET", ekNetto: 146.248 },
  { sku: "DSD111115", brand: "ESET", ekNetto: 83.90 },
  // Panda
  { sku: "170006", brand: "Panda", ekNetto: 8.245 },
  { sku: "170003", brand: "Panda", ekNetto: 14.445 },
  { sku: "170009", brand: "Panda", ekNetto: 16.510 },
  { sku: "170012", brand: "Panda", ekNetto: 24.775 },
  { sku: "170007", brand: "Panda", ekNetto: 12.375 },
  { sku: "170005", brand: "Panda", ekNetto: 20.640 },
  { sku: "170010", brand: "Panda", ekNetto: 22.705 },
  { sku: "170013", brand: "Panda", ekNetto: 34.460 },
  { sku: "170008", brand: "Panda", ekNetto: 16.510 },
  { sku: "170004", brand: "Panda", ekNetto: 22.705 },
  { sku: "170011", brand: "Panda", ekNetto: 30.970 },
  { sku: "170030", brand: "Panda", ekNetto: 6.99 },
  { sku: "170031", brand: "Panda", ekNetto: 8.99 },
  { sku: "170032", brand: "Panda", ekNetto: 9.99 },
  { sku: "170033", brand: "Panda", ekNetto: 10.99 },
  { sku: "170034", brand: "Panda", ekNetto: 9.75 },
  { sku: "170035", brand: "Panda", ekNetto: 14.95 },
  // AVG
  { sku: "AVGCAW1E1001", brand: "AVG", ekNetto: 11.894 },
  { sku: "AVGCAW2E1001", brand: "AVG", ekNetto: 19.269 },
  { sku: "AVGCAW3E1001", brand: "AVG", ekNetto: 15.244 },
  { sku: "DSD300100", brand: "AVG", ekNetto: 11.663 },
  { sku: "DSD300101", brand: "AVG", ekNetto: 23.326 },
  { sku: "DSD300102", brand: "AVG", ekNetto: 14.348 },
  { sku: "DSD300103", brand: "AVG", ekNetto: 27.926 },
  { sku: "AVGISW1E1003", brand: "AVG", ekNetto: 19.269 },
  { sku: "DSD300107", brand: "AVG", ekNetto: 27.580 },
  { sku: "DSD300029", brand: "AVG", ekNetto: 5.50 },
  { sku: "DSD300031", brand: "AVG", ekNetto: 3.00 },
  { sku: "DSD300110", brand: "AVG", ekNetto: 17.038 },
  { sku: "DSD300111", brand: "AVG", ekNetto: 25.117 },
  { sku: "DSD300112", brand: "AVG", ekNetto: 30.880 },
  { sku: "DSD300113", brand: "AVG", ekNetto: 37.413 },
  // Avast
  { sku: "230077", brand: "Avast", ekNetto: 23.996 },
  { sku: "230083", brand: "Avast", ekNetto: 11.996 },
  { sku: "230004", brand: "Avast", ekNetto: 23.996 },
  { sku: "230082", brand: "Avast", ekNetto: 16.996 },
  { sku: "PRO-2-24M", brand: "Avast", ekNetto: 16.996 },
  // McAfee
  { sku: "DSD260100", brand: "McAfee", ekNetto: 10.00 },
  { sku: "DSD260010", brand: "McAfee", ekNetto: 10.00 },
  { sku: "DSD260020", brand: "McAfee", ekNetto: 16.00 },
  { sku: "MCAFEE-IS-1PC", brand: "McAfee", ekNetto: 3.25 },
  { sku: "MCAFEE-IS-3PC", brand: "McAfee", ekNetto: 4.20 },
  { sku: "MCAFEE-IS-10D", brand: "McAfee", ekNetto: 4.90 },
  { sku: "DSD260030", brand: "McAfee", ekNetto: 16.00 },
  // Microsoft
  { sku: "DSD270026", brand: "Microsoft", ekNetto: 72.50 },
  { sku: "DSD270015", brand: "Microsoft", ekNetto: 92.50 },
  { sku: "AAA-04918", brand: "Microsoft", ekNetto: 90.5 },
  { sku: "8833910", brand: "Microsoft", ekNetto: 40.5 },
  { sku: "270052", brand: "Microsoft", ekNetto: 85.00 },
  { sku: "USO-00045", brand: "Microsoft", ekNetto: 175.00 },
  { sku: "270053", brand: "Microsoft", ekNetto: 176.00 },
  { sku: "DPY-00600", brand: "Microsoft", ekNetto: 199.9 },
  { sku: "DPZ-00006", brand: "Microsoft", ekNetto: 199.9 },
  { sku: "DSD340083", brand: "Microsoft", ekNetto: 99.90 },
  { sku: "DSD340084", brand: "Microsoft", ekNetto: 119.90 },
  // Norton
  { sku: "DSD190048", brand: "Norton", ekNetto: 16.00 },
  { sku: "DSD190045", brand: "Norton", ekNetto: 17.00 },
  { sku: "DSD190046", brand: "Norton", ekNetto: 19.00 },
  { sku: "DSD190047", brand: "Norton", ekNetto: 22.00 },
  { sku: "DSD190052", brand: "Norton", ekNetto: 20.00 },
  { sku: "DSD190024", brand: "Norton", ekNetto: 47.97 },
  { sku: "DSD191001", brand: "Norton", ekNetto: 12.00 },
  { sku: "DSD191007", brand: "Norton", ekNetto: 15.00 },
  { sku: "DSD191010", brand: "Norton", ekNetto: 20.75 },
  { sku: "DSD190053", brand: "Norton", ekNetto: 3.00 },
  { sku: "DSD190054", brand: "Norton", ekNetto: 5.50 },
  { sku: "DSD192004", brand: "Norton", ekNetto: 5.5 },
  { sku: "DSD192002", brand: "Norton", ekNetto: 13.33 },
  // Trend Micro
  { sku: "DSD150002", brand: "Trend Micro", ekNetto: 16.788 },
  { sku: "DSD151022", brand: "Trend Micro", ekNetto: 30.236 },
  { sku: "DSD151021", brand: "Trend Micro", ekNetto: 26.872 },
  { sku: "DSD151032", brand: "Trend Micro", ekNetto: 58.250 },
  // Bitdefender
  { sku: "160085", brand: "Bitdefender", ekNetto: 17.353 },
  { sku: "160086", brand: "Bitdefender", ekNetto: 28.917 },
  { sku: "160088", brand: "Bitdefender", ekNetto: 23.135 },
  { sku: "160089", brand: "Bitdefender", ekNetto: 40.488 },
  { sku: "160091", brand: "Bitdefender", ekNetto: 31.815 },
  { sku: "160092", brand: "Bitdefender", ekNetto: 49.168 },
  { sku: "160094", brand: "Bitdefender", ekNetto: 28.917 },
  { sku: "160095", brand: "Bitdefender", ekNetto: 46.277 },
  { sku: "160097", brand: "Bitdefender", ekNetto: 37.597 },
  { sku: "160098", brand: "Bitdefender", ekNetto: 57.848 },
  { sku: "160100", brand: "Bitdefender", ekNetto: 49.742 },
  { sku: "160101", brand: "Bitdefender", ekNetto: 63.630 },
  { sku: "160103", brand: "Bitdefender", ekNetto: 39.00 },
  { sku: "160104", brand: "Bitdefender", ekNetto: 75.201 },
  { sku: "160106", brand: "Bitdefender", ekNetto: 54.957 },
  { sku: "160107", brand: "Bitdefender", ekNetto: 86.772 },
  { sku: "160114", brand: "Bitdefender", ekNetto: 56.401 },
  { sku: "160115", brand: "Bitdefender", ekNetto: 91.319 },
  { sku: "160109", brand: "Bitdefender", ekNetto: 9.90 },
  { sku: "160110", brand: "Bitdefender", ekNetto: 14.90 },
  { sku: "160112", brand: "Bitdefender", ekNetto: 23.135 },
  { sku: "160113", brand: "Bitdefender", ekNetto: 34.699 },
  { sku: "160117", brand: "Bitdefender", ekNetto: 39.00 },
  { sku: "160118", brand: "Bitdefender", ekNetto: 54.957 },
  { sku: "160120", brand: "Bitdefender", ekNetto: 40.027 },
  { sku: "160121", brand: "Bitdefender", ekNetto: 54.957 },
  { sku: "160126", brand: "Bitdefender", ekNetto: 45.239 },
  { sku: "160127", brand: "Bitdefender", ekNetto: 69.909 },
  // F-Secure
  { sku: "FCFXBR1N003E1", brand: "F-Secure", ekNetto: 28.868 },
  { sku: "FCFXBR2N003E2", brand: "F-Secure", ekNetto: 46.189 },
  { sku: "FCFXBR1N005E1", brand: "F-Secure", ekNetto: 34.650 },
  { sku: "460017", brand: "F-Secure", ekNetto: 28.868 },
  { sku: "460001", brand: "F-Secure", ekNetto: 17.297 },
  { sku: "460007", brand: "F-Secure", ekNetto: 40.00 },
  { sku: "460025", brand: "F-Secure", ekNetto: 46.221 },
  { sku: "460026", brand: "F-Secure", ekNetto: 57.792 },
  // Acronis
  { sku: "DSD180089", brand: "Acronis", ekNetto: 30.983 },
  { sku: "DSD180063", brand: "Acronis", ekNetto: 55.778 },
  // ABBYY
  { sku: "FR03T-VFPCL", brand: "ABBYY", ekNetto: 126.746 },
  { sku: "FRCJM-MYPLS", brand: "ABBYY", ekNetto: 159.596 },
  // Parallels
  { sku: "PARALLELS-STD", brand: "Parallels", ekNetto: 71.00 },
];

// Brutto = Netto × 1.21 (NL-MwSt, kein Vorsteuerabzug bei §19 KU)
for (const p of dsd) p.ekBrutto = +(p.ekNetto * 1.21).toFixed(2);

// --- DB-Produkte aus seed.ts ---
import { readFileSync } from "node:fs";
const seedSrc = readFileSync(join(repoRoot, "packages/db/prisma/seed.ts"), "utf8");
// Parse die Produkt-Objekte mit RegExp (einfache Felder).
const dbProducts = [];
const regex = /\{\s*sku:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*brand:\s*"([^"]+)",\s*costPrice:\s*([\d.]+),\s*sellPrice:\s*([\d.]+)/g;
let m;
while ((m = regex.exec(seedSrc)) !== null) {
  dbProducts.push({
    sku: m[1], name: m[2], category: m[3], brand: m[4],
    costPrice: parseFloat(m[5]), sellPrice: parseFloat(m[6]),
  });
}

// --- Profitabilitäts-Filter ---
// Nach 10 % Refund + Stripe-Fees: netto = sellPrice * 0.9 - costPrice - (sellPrice * 0.029 + 0.25)
function netMargin(p) {
  return p.sellPrice * 0.9 - p.costPrice - (p.sellPrice * 0.029 + 0.25);
}

// --- Auto-Match: brand + costPrice ±0.05€ ---
const mappings = {};
const ambiguous = [];
const unmatched = [];
const unprofitable = [];

for (const db of dbProducts) {
  const margin = netMargin(db);
  if (margin < 1.5) {
    unprofitable.push({ ...db, margin: +margin.toFixed(2) });
    continue;
  }
  const candidates = dsd.filter(
    (d) => d.brand === db.brand && Math.abs(d.ekBrutto - db.costPrice) < 0.06,
  );
  if (candidates.length === 1) {
    mappings[db.sku] = candidates[0].sku;
  } else if (candidates.length > 1) {
    // Bei Ambiguität: Take erste; auch loggen.
    mappings[db.sku] = candidates[0].sku;
    ambiguous.push({
      dbSku: db.sku,
      name: db.name,
      cost: db.costPrice,
      candidates: candidates.map((c) => c.sku),
      chosen: candidates[0].sku,
    });
  } else {
    unmatched.push({ ...db, margin: +margin.toFixed(2) });
  }
}

// --- Output ---
console.log(`\n=== Mapping report ===`);
console.log(`DB products       : ${dbProducts.length}`);
console.log(`Mapped            : ${Object.keys(mappings).length}`);
console.log(`Ambiguous (auto)  : ${ambiguous.length}`);
console.log(`Unmatched         : ${unmatched.length}`);
console.log(`Unprofitable (<1.5€ marge): ${unprofitable.length}`);

if (ambiguous.length) {
  console.log(`\n--- Ambiguous matches (chose first) ---`);
  for (const a of ambiguous) {
    console.log(`  ${a.dbSku} (${a.cost}€) → [${a.candidates.join(", ")}] picked ${a.chosen}`);
  }
}
if (unmatched.length) {
  console.log(`\n--- Unmatched (NO DSD code found) ---`);
  for (const u of unmatched) {
    console.log(`  ${u.sku.padEnd(30)} ${u.brand.padEnd(14)} cost=${u.costPrice}€  margin=${u.margin}€`);
  }
}
if (unprofitable.length) {
  console.log(`\n--- Unprofitable (skipped) ---`);
  for (const u of unprofitable) {
    console.log(`  ${u.sku.padEnd(30)} cost=${u.costPrice}€ sell=${u.sellPrice}€  margin=${u.margin}€`);
  }
}

const outPath = join(repoRoot, "apps/web/lib/dsd-mappings.generated.ts");
const ts = `// AUTO-GENERATED by scripts/generate-dsd-mapping.mjs — do not edit by hand.
// Maps internal DB SKU → DSD product code (used by /api/admin/backfill-dsd).
export const DSD_MAPPINGS: Record<string, string> = ${JSON.stringify(mappings, null, 2)};
`;
writeFileSync(outPath, ts);
console.log(`\nWrote ${outPath} (${Object.keys(mappings).length} mappings)\n`);
