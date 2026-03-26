/**
 * Elena (Pricing) + Felix (Frontend): Katalog-Bereinigung
 * 
 * Setzt DSD-EK als costPrice, passt VK an, deaktiviert unprofitable Produkte.
 * Run: npx tsx scripts/catalog-cleanup.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 14 profitable Produkte mit echten DSD-EK-Preisen
const profitableProducts: { sku: string; costPrice: number; sellPrice: number }[] = [
  { sku: "MCAFEE-IS-1PC-1Y",       costPrice: 3.25,   sellPrice: 9.99 },
  { sku: "MCAFEE-IS-3PC-1Y",       costPrice: 4.20,   sellPrice: 12.99 },
  { sku: "MCAFEE-IS-10D-1Y",       costPrice: 4.90,   sellPrice: 14.99 },
  { sku: "MCAFEE-TP-1PC-1Y",       costPrice: 10.00,  sellPrice: 16.99 },
  { sku: "MCAFEE-TP-10PC-1Y",      costPrice: 16.00,  sellPrice: 24.99 },
  { sku: "MCAFEE-LIVESAFE-UNL-1Y", costPrice: 16.00,  sellPrice: 29.99 },
  { sku: "NORTON-360-DLX-3D-1Y",   costPrice: 17.00,  sellPrice: 26.99 },
  { sku: "NORTON-360-DLX-5D-1Y",   costPrice: 19.00,  sellPrice: 29.99 },
  { sku: "NORTON-360-PREM-10D-1Y", costPrice: 22.00,  sellPrice: 34.99 },
  { sku: "MS-OFFICE-HS-2021",      costPrice: 85.00,  sellPrice: 119.99 },
  { sku: "MS-OFFICE-HB-2021",      costPrice: 176.00, sellPrice: 229.99 },
  { sku: "WIN11-PRO-OEM",          costPrice: 119.90, sellPrice: 159.99 },
  { sku: "WIN11-HOME-OEM",         costPrice: 99.90,  sellPrice: 134.99 },
  { sku: "PARALLELS-18-STD-1Y",    costPrice: 71.00,  sellPrice: 94.99 },
];

// Alle unprofitablen SKUs
const unprofitableSkus = [
  "NORTON-360-STD-1Y",
  "TREND-IS-1PC-1Y", "TREND-IS-3PC-1Y", "TREND-IS-5PC-2Y",
  "TREND-MAXSEC-5PC-1Y", "TREND-MAXSEC-3PC-2Y", "TREND-MAXSEC-5PC-2Y",
  "TREND-MAXSEC-3PC-3Y", "TREND-MAXSEC-5PC-3Y",
  "BITDEF-AV-1PC-1Y", "BITDEF-AV-3PC-1Y",
  "BITDEF-IS-5PC-1Y",
  "BITDEF-TS-5D-1Y", "BITDEF-TS-10D-1Y", "BITDEF-TS-10D-2Y",
  "BITDEF-FAMILY-15D-1Y",
  "PANDA-ADV-1PC-1Y", "PANDA-ADV-3PC-1Y", "PANDA-COMP-5PC-1Y",
  "FSEC-IS-1PC-1Y", "FSEC-SAFE-3D-1Y",
  "MS365-PERSONAL-1Y", "MS365-FAMILY-1Y",
];

async function main(): Promise<void> {
  console.log("🧹 Katalog-Bereinigung gestartet...\n");

  // 1. Profitable Produkte: EK + VK aktualisieren
  console.log("📈 Profitable Produkte aktualisieren:");
  for (const p of profitableProducts) {
    const minimumMargin = +(p.sellPrice * 0.15).toFixed(2);
    const result = await prisma.product.updateMany({
      where: { sku: p.sku },
      data: {
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        minimumMargin,
      },
    });
    const status = result.count > 0 ? "✅" : "⚠️  NICHT GEFUNDEN";
    console.log(`  ${status} ${p.sku}: EK=${p.costPrice}, VK=${p.sellPrice}`);
  }

  // 2. Unprofitable Produkte: stockLevel=0 (soft-delete wegen Order-Referenzen)
  console.log("\n🗑️  Unprofitable Produkte deaktivieren:");
  for (const sku of unprofitableSkus) {
    const result = await prisma.product.updateMany({
      where: { sku },
      data: { stockLevel: 0 },
    });
    const status = result.count > 0 ? "❌" : "⚠️  NICHT IN DB";
    console.log(`  ${status} ${sku} → stockLevel=0`);
  }

  // 3. Zusammenfassung
  const activeCount = await prisma.product.count({ where: { stockLevel: { gt: 0 } } });
  const totalCount = await prisma.product.count();
  console.log(`\n📊 Ergebnis: ${activeCount} aktive von ${totalCount} Produkten`);
  console.log("✅ Katalog-Bereinigung abgeschlossen.");
}

main()
  .catch((e: unknown) => {
    console.error("❌ Fehler:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
