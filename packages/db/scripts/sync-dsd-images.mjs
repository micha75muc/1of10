/**
 * Sync official DSD product images into our DB.
 *
 * For every Product with a dsdProductCode, look up the matching DSD catalog
 * entry and set imageUrl = packshotImage (preferred) or image (fallback).
 *
 * Run: cd packages/db && node scripts/sync-dsd-images.mjs [--apply] [--overwrite]
 *   --apply     : actually write to DB; otherwise dry-run
 *   --overwrite : also replace existing imageUrl values; otherwise only fill nulls
 */
import pkg from "@prisma/client";
import fs from "node:fs";

const { PrismaClient } = pkg;
const CATALOG = "/tmp/dsd_full_catalog.json";
const APPLY = process.argv.includes("--apply");
const OVERWRITE = process.argv.includes("--overwrite");

if (!fs.existsSync(CATALOG)) {
  console.error(`Missing ${CATALOG}. Pull from Hetzner first:`);
  console.error("  scp root@178.104.52.53:/opt/1of10/dsd_full_catalog.json /tmp/");
  process.exit(1);
}

const dsd = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const byCode = new Map(dsd.map((p) => [String(p.productCode), p]));

const prisma = new PrismaClient();
const products = await prisma.product.findMany({
  where: { dsdProductCode: { not: null } },
  select: { sku: true, name: true, imageUrl: true, dsdProductCode: true },
});

let willUpdate = 0;
let skipped = 0;
let noMatch = 0;
const updates = [];

for (const p of products) {
  const dsdEntry = byCode.get(String(p.dsdProductCode));
  if (!dsdEntry) {
    noMatch++;
    console.log(`  ⚠ no DSD catalog entry for ${p.sku} (code ${p.dsdProductCode})`);
    continue;
  }
  const newUrl = dsdEntry.packshotImage || dsdEntry.image;
  if (!newUrl || /no-image/i.test(newUrl)) {
    noMatch++;
    continue;
  }
  if (p.imageUrl && !OVERWRITE) {
    skipped++;
    continue;
  }
  if (p.imageUrl === newUrl) {
    skipped++;
    continue;
  }
  willUpdate++;
  updates.push({ sku: p.sku, oldUrl: p.imageUrl, newUrl });
}

console.log(`\n=== DSD Image Sync (${products.length} products with dsdProductCode) ===`);
console.log(`  will update : ${willUpdate}`);
console.log(`  skipped     : ${skipped}  (already has image; use --overwrite to replace)`);
console.log(`  no match    : ${noMatch}\n`);

for (const u of updates.slice(0, 20)) {
  console.log(`  ${u.sku.padEnd(32)} ${u.oldUrl ? "REPLACE" : "SET    "} → ${u.newUrl}`);
}
if (updates.length > 20) console.log(`  ... and ${updates.length - 20} more`);

if (APPLY) {
  let n = 0;
  for (const u of updates) {
    await prisma.product.update({ where: { sku: u.sku }, data: { imageUrl: u.newUrl } });
    n++;
  }
  console.log(`\n✅ Updated ${n} products.`);
} else {
  console.log("\n(Dry-run — use --apply to write to DB)");
}

await prisma.$disconnect();
