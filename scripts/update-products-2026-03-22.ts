/**
 * Product DB Update — 2026-03-22
 * Nestor (Procurement): Neue DSD-Preisliste einarbeiten
 * Elena (Finance): Marktgerechte VK, Kaspersky/AVG/Avast raus
 * 
 * Usage: cd packages/db && npx tsx ../../scripts/update-products-2026-03-22.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Produkte die ENTFERNT werden (nicht bei DSD oder Reputationsrisiko)
const REMOVE_SKUS = [
  "AVG-TUNEUP-10D-1Y",     // Nicht in neuer DSD-Liste
  "AVAST-PREM-10D-1Y",     // Nicht in neuer DSD-Liste
  "KASPERSKY-PLUS-3D-1Y",  // BSI-Warnung, Reputationsrisiko
];

// Produkte die AKTUALISIERT werden (neue DSD-EK Preise!)
const UPDATES = [
  // Norton — drastisch günstigere EK!
  { sku: "NORTON-360-STD-1Y",       costPrice: 6.00,  sellPrice: 14.99 },
  { sku: "NORTON-360-DLX-5D-1Y",    costPrice: 11.75, sellPrice: 24.99 },
  { sku: "NORTON-360-PREM-10D-1Y",  costPrice: 14.40, sellPrice: 34.99 },
  // McAfee — EK anpassen auf neue DSD-Preise
  { sku: "MCAFEE-TP-3PC-1Y",        costPrice: 7.80,  sellPrice: 14.99, name: "McAfee Total Protection 1-PC 1 Jahr", description: "Umfassender Schutz vor Viren, Malware und Online-Bedrohungen. Echtzeitschutz, sichere VPN und Passwort-Manager." },
  { sku: "MCAFEE-TP-UNL-1Y",        costPrice: 11.80, sellPrice: 24.99, name: "McAfee Total Protection 10-PC 1 Jahr", description: "Schützen Sie bis zu 10 Geräte mit einem Abonnement. Antivirus, VPN, Identitätsschutz und Firewall inklusive." },
];

// NEUE Produkte
const NEW_PRODUCTS = [
  // Norton Deluxe 3-Geräte — sweet spot
  {
    sku: "NORTON-360-DLX-3D-1Y",
    name: "Norton 360 Deluxe 3-Geräte 1 Jahr",
    description: "Norton 360 Deluxe für 3 Geräte mit VPN, Passwort-Manager und 25 GB Cloud-Backup. Schutz für die kleine Familie.",
    category: "Antivirus",
    brand: "Norton",
    costPrice: 8.00,
    sellPrice: 19.99,
    stockLevel: 50,
  },
  // McAfee LiveSafe Unlimited
  {
    sku: "MCAFEE-LIVESAFE-UNL-1Y",
    name: "McAfee LiveSafe Unbegrenzte Geräte 1 Jahr",
    description: "Schützen Sie alle Ihre Geräte ohne Limit. McAfees Premium-Lösung mit Antivirus, VPN, Identitätsschutz und sicherem Speicher.",
    category: "Antivirus",
    brand: "McAfee",
    costPrice: 14.80,
    sellPrice: 29.99,
    stockLevel: 30,
  },
  // Bitdefender Total Security 5-Dev
  {
    sku: "BITDEF-TS-5D-1Y",
    name: "Bitdefender Total Security 5-Geräte 1 Jahr",
    description: "Nr. 1 in unabhängigen AV-Tests. Umfassender Schutz für Windows, macOS, iOS und Android mit VPN und Kindersicherung.",
    category: "Antivirus",
    brand: "Bitdefender",
    costPrice: 29.00,
    sellPrice: 44.99,
    stockLevel: 30,
  },
  // Bitdefender Total Security 10-Dev
  {
    sku: "BITDEF-TS-10D-1Y",
    name: "Bitdefender Total Security 10-Geräte 1 Jahr",
    description: "Preisgekrönter Schutz für die ganze Familie. 10 Geräte, alle Plattformen, mit VPN, Kindersicherung und Anti-Ransomware.",
    category: "Antivirus",
    brand: "Bitdefender",
    costPrice: 29.00,
    sellPrice: 44.99,
    stockLevel: 25,
  },
  // Bitdefender Family Pack
  {
    sku: "BITDEF-FAMILY-15D-1Y",
    name: "Bitdefender Family Pack 15-Geräte 1 Jahr",
    description: "Das ultimative Familien-Paket: 15 Geräte schützen mit Bitdefenders bestem Schutz. Ideal für Großfamilien und Haushalte mit vielen Geräten.",
    category: "Antivirus",
    brand: "Bitdefender",
    costPrice: 30.00,
    sellPrice: 49.99,
    stockLevel: 20,
  },
  // Trend Micro Maximum Security 5-PC
  {
    sku: "TREND-MAXSEC-5PC-1Y",
    name: "Trend Micro Maximum Security 5-PC 1 Jahr",
    description: "Fortschrittlicher Schutz vor Ransomware, Phishing und Online-Betrug. Mit Social-Media-Schutz und Kindersicherung für bis zu 5 Geräte.",
    category: "Antivirus",
    brand: "Trend Micro",
    costPrice: 8.20,
    sellPrice: 16.99,
    stockLevel: 40,
  },
  // Trend Micro Maximum Security 3-PC 2 Jahre
  {
    sku: "TREND-MAXSEC-3PC-2Y",
    name: "Trend Micro Maximum Security 3-PC 2 Jahre",
    description: "2 Jahre sorgenfreier Schutz für 3 Geräte. Die günstigste 2-Jahres-Lösung für Einzelpersonen und kleine Familien.",
    category: "Antivirus",
    brand: "Trend Micro",
    costPrice: 7.50,
    sellPrice: 14.99,
    stockLevel: 35,
  },
];

async function main() {
  console.log("🔄 Product Update — 2026-03-22\n");

  // 1. Entfernen
  console.log("🗑️  Entferne veraltete Produkte...");
  for (const sku of REMOVE_SKUS) {
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      // Check for orders first
      const orderCount = await prisma.order.count({ where: { productId: existing.id } });
      if (orderCount > 0) {
        // Don't delete, just set stock to 0
        await prisma.product.update({ where: { sku }, data: { stockLevel: 0 } });
        console.log(`  ⚠️  ${sku} — Stock auf 0 (hat ${orderCount} Bestellungen)`);
      } else {
        await prisma.product.delete({ where: { sku } });
        console.log(`  ✅ ${sku} — gelöscht`);
      }
    } else {
      console.log(`  ⏭️  ${sku} — existiert nicht`);
    }
  }

  // 2. Aktualisieren
  console.log("\n📝 Aktualisiere bestehende Produkte (neue DSD-EK)...");
  for (const u of UPDATES) {
    const data: Record<string, unknown> = {
      costPrice: u.costPrice,
      sellPrice: u.sellPrice,
      minimumMargin: +(u.sellPrice * 0.15).toFixed(2),
    };
    if ('name' in u && u.name) data.name = u.name;
    if ('description' in u && u.description) data.description = u.description;

    const result = await prisma.product.updateMany({ where: { sku: u.sku }, data });
    if (result.count > 0) {
      console.log(`  ✅ ${u.sku} — EK: ${u.costPrice}€, VK: ${u.sellPrice}€`);
    } else {
      console.log(`  ⏭️  ${u.sku} — nicht gefunden`);
    }
  }

  // 3. Neue Produkte
  console.log("\n🆕 Füge neue Produkte hinzu...");
  for (const p of NEW_PRODUCTS) {
    const minimumMargin = +(p.sellPrice * 0.15).toFixed(2);
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        description: p.description,
        category: p.category,
        brand: p.brand,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        minimumMargin,
        stockLevel: p.stockLevel,
      },
      create: { ...p, minimumMargin },
    });
    console.log(`  ✅ ${p.sku} — ${p.name} (EK: ${p.costPrice}€, VK: ${p.sellPrice}€)`);
  }

  // 4. Summary
  const allProducts = await prisma.product.findMany({
    where: { stockLevel: { gt: 0 } },
    orderBy: { sellPrice: "asc" },
    select: { sku: true, name: true, costPrice: true, sellPrice: true, brand: true, stockLevel: true },
  });

  console.log("\n📊 Aktuelle Produktliste:");
  console.log("─".repeat(90));
  for (const p of allProducts) {
    const ek = Number(p.costPrice);
    const vk = Number(p.sellPrice);
    const margin = vk * 0.9 - ek - (vk * 0.029 + 0.25);
    console.log(
      `  ${p.sku.padEnd(28)} ${p.name.substring(0, 35).padEnd(36)} EK: ${ek.toFixed(2).padStart(6)}€  VK: ${vk.toFixed(2).padStart(6)}€  Netto: ${margin.toFixed(2).padStart(6)}€`
    );
  }
  console.log("─".repeat(90));
  console.log(`  ${allProducts.length} aktive Produkte\n`);
}

main()
  .catch((e) => { console.error("❌ Fehler:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
