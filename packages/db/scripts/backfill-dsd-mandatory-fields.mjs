#!/usr/bin/env node
/**
 * Backfill `dsdMandatoryClientFields` from DSD `view.json`.
 *
 * Background — confirmed by Jody van Gils (DSD support) on 2026-04-30:
 *   "in den Produktinformationen wird beim Aufrufen der Produktdetails
 *    angezeigt, welche Felder verpflichtend sind. Section 3.2 of the API
 *    handbook (`view.xml` / `view.json`) returns a `mandatoryClientFields`
 *    string per product, e.g. `email,first_name,last_name`."
 *
 * Why store it locally instead of calling DSD live before each quickOrder?
 *   1. quickOrder happens inside the Stripe-webhook hot path — adding a
 *      synchronous DSD round-trip would inflate webhook latency.
 *   2. The set of mandatory fields is a per-product attribute that only
 *      changes when DSD updates their catalog — we already re-sync the
 *      catalog separately, so this is the natural moment to capture it.
 *   3. We want offline visibility ("which SKUs need `phone`?") without
 *      hitting the API.
 *
 * Usage:
 *   node packages/db/scripts/backfill-dsd-mandatory-fields.mjs --dry
 *   node packages/db/scripts/backfill-dsd-mandatory-fields.mjs --apply
 *
 * Requires DSD_API_BASE_URL / DSD_API_USERNAME / DSD_API_PASSWORD in env.
 *
 * NB: DSD Europe whitelists API access by source IP. From a non-whitelisted
 * host (e.g. local dev/Codespaces) you will see error_code 12. Whitelisted
 * environments: Vercel build runners and our Hetzner agents container —
 * easiest is to run this from the agents container.
 */
import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const DRY = !APPLY;

const DSD_BASE = (process.env.DSD_API_BASE_URL || "").replace(/\/$/, "");
const DSD_USER = process.env.DSD_API_USERNAME || "";
const DSD_PASS = process.env.DSD_API_PASSWORD || "";

if (!DSD_BASE || !DSD_USER || !DSD_PASS) {
  console.error(
    "❌ DSD_API_BASE_URL / DSD_API_USERNAME / DSD_API_PASSWORD missing in env",
  );
  process.exit(1);
}

const prisma = new PrismaClient();

const basicAuth =
  "Basic " + Buffer.from(`${DSD_USER}:${DSD_PASS}`).toString("base64");

/**
 * Login to DSD — sets a CakePHP session cookie (`CAKEPHP=…`) that subsequent
 * requests reuse. The DSD API requires both Basic Auth AND a logged-in
 * session cookie (yes, two layers — see API manual §2). DSD's stack is
 * CakePHP-on-PHP-7, hence the `CAKEPHP` cookie name (not `PHPSESSID`).
 */
async function login() {
  const res = await fetch(`${DSD_BASE}/login.json`, {
    method: "GET",
    headers: { Authorization: basicAuth },
  });
  if (!res.ok) {
    throw new Error(`DSD login failed: HTTP ${res.status}`);
  }
  // node fetch returns set-cookie headers concatenated by comma — but each
  // cookie internally also uses commas (in expires=…). Use raw getSetCookie()
  // when available, otherwise fall back to splitting on ", " before key=val.
  const raw =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : (res.headers.get("set-cookie") ?? "").split(/,(?=\s*[^=,;\s]+=)/);
  const cookies = raw.map((c) => c.split(";")[0].trim()).filter(Boolean);
  if (!cookies.length) {
    throw new Error("DSD login returned no Set-Cookie header");
  }
  return cookies.join("; ");
}

/**
 * `view.json` accepts a form-encoded array `0=DSD110001&1=DSD110002`.
 * Returns either a single product object or an array — we normalise.
 */
async function viewProducts(sessionCookie, codes) {
  const body = new URLSearchParams();
  codes.forEach((code, i) => body.append(String(i), code));
  const res = await fetch(`${DSD_BASE}/view.json`, {
    method: "POST",
    headers: {
      Authorization: basicAuth,
      Cookie: sessionCookie,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`DSD view.json HTTP ${res.status}`);
  const json = await res.json();
  // DSD signals IP-allowlist failures with error_code 12 inside an HTTP-200.
  // Surface those loudly so the operator knows it's not a data issue.
  if (json?.response?.error_code === 12) {
    throw new Error(
      `DSD blocked request: ${json.response.message ?? "IP not allowed"}`,
    );
  }
  // DSD wraps single results in {ProductArray: …}, lists in {products: [{ProductArray: …}, …]}
  if (Array.isArray(json)) return json.map((x) => x.ProductArray ?? x);
  if (json.products && Array.isArray(json.products)) {
    return json.products.map((x) => x.ProductArray ?? x);
  }
  if (json.ProductArray) return [json.ProductArray];
  return [json];
}

async function main() {
  console.log(
    `\n=== Backfill dsdMandatoryClientFields (${DRY ? "DRY-RUN" : "APPLY"}) ===\n`,
  );

  const products = await prisma.product.findMany({
    where: { dsdProductCode: { not: null } },
    select: { id: true, sku: true, name: true, dsdProductCode: true },
  });
  console.log(`→ ${products.length} products with dsdProductCode\n`);

  const cookie = await login();
  console.log(`✓ DSD login OK\n`);

  // view.json accepts a batch — go in chunks of 20 to stay friendly.
  const CHUNK = 20;
  const updates = [];
  const skipped = [];

  for (let i = 0; i < products.length; i += CHUNK) {
    const batch = products.slice(i, i + CHUNK);
    const codes = batch.map((p) => p.dsdProductCode).filter(Boolean);
    let dsdProducts;
    try {
      dsdProducts = await viewProducts(cookie, codes);
    } catch (err) {
      console.error(`✗ batch ${i / CHUNK + 1} failed: ${err.message}`);
      continue;
    }
    // Map by productCode for join
    const byCode = new Map();
    for (const p of dsdProducts) {
      const code = p.productCode ?? p.product_code ?? null;
      if (code) byCode.set(code, p);
    }
    for (const local of batch) {
      const dsd = byCode.get(local.dsdProductCode);
      if (!dsd) {
        skipped.push({ sku: local.sku, reason: "not in DSD catalog" });
        continue;
      }
      const mandatory = (dsd.mandatoryClientFields ?? "").trim();
      if (!mandatory) {
        skipped.push({ sku: local.sku, reason: "no mandatoryClientFields" });
        continue;
      }
      updates.push({
        id: local.id,
        sku: local.sku,
        name: local.name,
        fields: mandatory,
      });
    }
    process.stdout.write(
      `  batch ${Math.floor(i / CHUNK) + 1}/${Math.ceil(products.length / CHUNK)} done\r`,
    );
  }
  console.log("\n");

  // Group by field-set for a readable summary
  const bySet = new Map();
  for (const u of updates) {
    const k = u.fields;
    if (!bySet.has(k)) bySet.set(k, []);
    bySet.get(k).push(u.sku);
  }
  console.log("=== Summary ===");
  for (const [fields, skus] of [...bySet.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  )) {
    console.log(`  [${fields}] → ${skus.length} SKUs`);
  }
  console.log(`  skipped: ${skipped.length}\n`);

  if (DRY) {
    console.log("(dry-run — no writes; pass --apply to persist)\n");
    await prisma.$disconnect();
    return;
  }

  let written = 0;
  for (const u of updates) {
    await prisma.product.update({
      where: { id: u.id },
      data: { dsdMandatoryClientFields: u.fields },
    });
    written++;
  }
  console.log(`✓ wrote ${written} products`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
