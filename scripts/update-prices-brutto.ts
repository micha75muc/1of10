/**
 * Felix (Frontend) — Preiskorrektur: EK auf Brutto (DSD-Netto × 1.21) setzen
 * Kleinunternehmer §19 UStG — kein Vorsteuerabzug, NL-MwSt ist echte Kostenposition.
 *
 * Führt per Prisma ein direktes DB-Update durch.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const priceUpdates = [
  // SKU, costPrice (brutto = netto × 1.21), sellPrice (neuer VK)
  { sku: "MCAFEE-IS-1PC-1Y",       costPrice: 3.93,   sellPrice: 9.99 },
  { sku: "MCAFEE-IS-3PC-1Y",       costPrice: 5.08,   sellPrice: 12.99 },
  { sku: "MCAFEE-IS-10D-1Y",       costPrice: 5.93,   sellPrice: 14.99 },
  { sku: "MCAFEE-TP-1PC-1Y",       costPrice: 12.10,  sellPrice: 17.99 },
  { sku: "MCAFEE-TP-10PC-1Y",      costPrice: 19.36,  sellPrice: 26.99 },
  { sku: "MCAFEE-LIVESAFE-UNL-1Y", costPrice: 19.36,  sellPrice: 29.99 },
  { sku: "NORTON-360-DLX-3D-1Y",   costPrice: 20.57,  sellPrice: 27.99 },
  { sku: "NORTON-360-DLX-5D-1Y",   costPrice: 22.99,  sellPrice: 30.99 },
  { sku: "NORTON-360-PREM-10D-1Y", costPrice: 26.62,  sellPrice: 34.99 },
  { sku: "WIN11-HOME-OEM",         costPrice: 120.88, sellPrice: 144.99 },
  { sku: "MS-OFFICE-HS-2021",      costPrice: 102.85, sellPrice: 124.99 },
  { sku: "WIN11-PRO-OEM",          costPrice: 145.08, sellPrice: 174.99 },
  { sku: "MS-OFFICE-HB-2021",      costPrice: 212.96, sellPrice: 249.99 },
  { sku: "PARALLELS-18-STD-1Y",    costPrice: 85.91,  sellPrice: 104.99 },
];

async function main(): Promise<void> {
  console.log("💰 Preiskorrektur: EK → Brutto (×1.21), VK → neue Staffelung\n");

  for (const u of priceUpdates) {
    const minimumMargin = +(u.sellPrice * 0.15).toFixed(2);

    const result = await prisma.product.update({
      where: { sku: u.sku },
      data: {
        costPrice: u.costPrice,
        sellPrice: u.sellPrice,
        minimumMargin,
      },
      select: { sku: true, name: true, costPrice: true, sellPrice: true },
    });

    // Margin-Check: VK×0.9 - EK - (VK×0.029 + 0.25)
    const vk = u.sellPrice;
    const netto = vk * 0.9 - u.costPrice - (vk * 0.029 + 0.25);

    console.log(
      `  ✅ ${result.sku.padEnd(25)} EK: ${String(u.costPrice).padStart(7)}€  VK: ${String(u.sellPrice).padStart(7)}€  Netto/Verkauf: ${netto.toFixed(2)}€`
    );

    if (netto < 3.0) {
      console.error(`  ❌ WARNUNG: ${result.sku} hat Netto ${netto.toFixed(2)}€ < 3,00€!`);
    }
  }

  console.log("\n✅ Alle 14 Produkte aktualisiert.");
}

main()
  .catch((e: unknown) => {
    console.error("❌ Fehler:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
