#!/usr/bin/env node
/**
 * Apply DSD mandatoryClientFields backfill from a JSON file.
 *
 * Reads { sku: "csv-or-'None are mandatory'" } from --file, normalises
 * "None are mandatory" → null, updates Product.dsdMandatoryClientFields
 * for every match by dsdProductCode.
 *
 * Usage:
 *   node packages/db/scripts/apply-dsd-mandatory-fields.mjs --file=/tmp/dsd-result.json --dry
 *   node packages/db/scripts/apply-dsd-mandatory-fields.mjs --file=/tmp/dsd-result.json --apply
 *
 * Why split fetch (Python on Hetzner) from apply (Node here)?
 *   DSD whitelists by source IP, so the fetch must run on a whitelisted
 *   host. The DB lives on Neon and is reachable from anywhere — so we
 *   fetch on Hetzner, ship the JSON back, and apply locally.
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const file = args.file;
const APPLY = !!args.apply;

if (!file || !fs.existsSync(file)) {
  console.error("❌ --file=... missing or not found");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(file, "utf8"));
const prisma = new PrismaClient();

function normalise(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  // DSD returns this literal phrase for products without required fields.
  if (/^none\s+are\s+mandatory$/i.test(s)) return null;
  return s
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
    .join(",");
}

const updates = Object.entries(raw).map(([code, value]) => ({
  code,
  value: normalise(value),
}));

console.log(
  `Read ${updates.length} entries. Mode: ${APPLY ? "APPLY" : "DRY-RUN"}`,
);

let matched = 0;
let updated = 0;
let unchanged = 0;
let missing = 0;

for (const { code, value } of updates) {
  const products = await prisma.product.findMany({
    where: { dsdProductCode: code },
    select: { id: true, sku: true, dsdMandatoryClientFields: true },
  });
  if (products.length === 0) {
    missing++;
    continue;
  }
  matched += products.length;
  const stale = products.filter(
    (p) => p.dsdMandatoryClientFields !== value,
  );
  if (stale.length === 0) {
    unchanged += products.length;
    continue;
  }
  for (const p of stale) {
    console.log(
      `  ${code} (${p.sku}): ${p.dsdMandatoryClientFields ?? "null"} → ${
        value ?? "null"
      }`,
    );
  }
  unchanged += products.length - stale.length;
  if (APPLY) {
    await prisma.product.updateMany({
      where: { dsdProductCode: code },
      data: { dsdMandatoryClientFields: value },
    });
  }
  updated += stale.length;
}

console.log(
  `\nMatched: ${matched}  ·  Updated: ${updated}  ·  Unchanged: ${unchanged}  ·  Missing in DB: ${missing}`,
);
if (!APPLY) console.log("Dry-run only — re-run with --apply to write.");

await prisma.$disconnect();
