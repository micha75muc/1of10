#!/usr/bin/env node
/**
 * Backfill `requiresVendorAccount`, `vendorName`, `vendorActivationUrl`
 * for all products based on their `brand`. Run with `--apply` to commit.
 *
 * Why: fast majority of B2C-Antivirus and Office-Suite vendors require the
 * end customer to create a vendor account before they can redeem the
 * activation key (Trend Micro, AVG, Norton, …). We surface this on the
 * confirm-page and in the order-confirmation email so customers are not
 * confused when they click the activation link.
 */
import { PrismaClient } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const prisma = new PrismaClient();

/**
 * Brand → vendor activation flow.
 * - requiresVendorAccount: must the customer create / log into a vendor
 *   account before redeeming the key?
 * - vendorName: human-friendly label used in copy
 * - vendorActivationUrl: deep-link to the vendor activation landing
 */
const VENDOR_MAP = {
  "Trend Micro": {
    requiresVendorAccount: true,
    vendorName: "Trend Micro",
    vendorActivationUrl: "https://account.trendmicro.com/setup/landing",
  },
  AVG: {
    requiresVendorAccount: true,
    vendorName: "AVG",
    vendorActivationUrl: "https://www.avg.com/activation",
  },
  Avast: {
    requiresVendorAccount: true,
    vendorName: "Avast",
    vendorActivationUrl: "https://www.avast.com/activate",
  },
  Norton: {
    requiresVendorAccount: true,
    vendorName: "Norton",
    vendorActivationUrl: "https://my.norton.com/extspa/setup",
  },
  McAfee: {
    requiresVendorAccount: true,
    vendorName: "McAfee",
    vendorActivationUrl: "https://home.mcafee.com/root/login.aspx",
  },
  Kaspersky: {
    requiresVendorAccount: true,
    vendorName: "Kaspersky",
    vendorActivationUrl: "https://my.kaspersky.com/",
  },
  Bitdefender: {
    requiresVendorAccount: true,
    vendorName: "Bitdefender",
    vendorActivationUrl: "https://central.bitdefender.com/",
  },
  ESET: {
    requiresVendorAccount: true,
    vendorName: "ESET",
    vendorActivationUrl: "https://my.eset.com/",
  },
  "F-Secure": {
    requiresVendorAccount: true,
    vendorName: "F-Secure",
    vendorActivationUrl: "https://my.f-secure.com/",
  },
  Panda: {
    requiresVendorAccount: true,
    vendorName: "Panda Security",
    vendorActivationUrl: "https://my.pandasecurity.com/",
  },
  Acronis: {
    requiresVendorAccount: true,
    vendorName: "Acronis",
    vendorActivationUrl: "https://account.acronis.com/",
  },
  Microsoft: {
    requiresVendorAccount: true,
    vendorName: "Microsoft",
    vendorActivationUrl: "https://setup.office.com/",
  },
  Parallels: {
    requiresVendorAccount: true,
    vendorName: "Parallels",
    vendorActivationUrl: "https://my.parallels.com/",
  },
  // Direct-activation vendors (no account needed — key + download is enough)
  "G Data": {
    requiresVendorAccount: false,
    vendorName: "G Data",
    vendorActivationUrl: "https://www.gdata.de/downloads",
  },
  ABBYY: {
    requiresVendorAccount: false,
    vendorName: "ABBYY",
    vendorActivationUrl: "https://www.abbyy.com/finereader/download/",
  },
  // House-brand test entries
  "1of10": {
    requiresVendorAccount: false,
    vendorName: null,
    vendorActivationUrl: null,
  },
};

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, sku: true, brand: true, requiresVendorAccount: true },
  });

  let toUpdate = 0;
  let unmapped = [];
  const updates = [];

  for (const p of products) {
    const key = p.brand;
    const m = key && VENDOR_MAP[key];
    if (!m) {
      if (key) unmapped.push(`${p.sku} (${key})`);
      continue;
    }
    updates.push({ id: p.id, sku: p.sku, brand: key, ...m });
    toUpdate++;
  }

  console.log(`\nProdukte: ${products.length}`);
  console.log(`Zu aktualisieren: ${toUpdate}`);
  if (unmapped.length) {
    console.log(`\n⚠️  Brands ohne Vendor-Mapping (${unmapped.length}):`);
    unmapped.forEach((u) => console.log("   -", u));
  }

  // Group preview
  const byBrand = {};
  for (const u of updates) {
    byBrand[u.brand] = byBrand[u.brand] || { count: 0, ...u };
    byBrand[u.brand].count++;
  }
  console.log("\nMapping-Übersicht:");
  for (const [b, v] of Object.entries(byBrand).sort()) {
    const tag = v.requiresVendorAccount ? "✅ Account" : "⚪ Direct";
    console.log(`  ${tag.padEnd(12)} ${b.padEnd(14)} ${String(v.count).padStart(2)}× → ${v.vendorActivationUrl ?? "(none)"}`);
  }

  if (!APPLY) {
    console.log("\n(dry-run — nichts geschrieben. Nochmal mit --apply.)");
    await prisma.$disconnect();
    return;
  }

  console.log("\nSchreibe …");
  for (const u of updates) {
    await prisma.product.update({
      where: { id: u.id },
      data: {
        requiresVendorAccount: u.requiresVendorAccount,
        vendorName: u.vendorName,
        vendorActivationUrl: u.vendorActivationUrl,
      },
    });
  }
  console.log(`✅ ${updates.length} Produkte aktualisiert.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
