import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

const products = [
  // Norton (DSD Non-Subscription)
  { sku: "NORTON-360-STD-1Y", name: "Norton 360 Standard — 1 Gerät, 1 Jahr", category: "Antivirus", brand: "Norton", costPrice: 6.00, sellPrice: 14.99, stockLevel: 50, description: "Norton 360 Standard mit Echtzeitschutz, VPN, Passwort-Manager und 10 GB Cloud-Backup für 1 Gerät." },
  { sku: "NORTON-360-DLX-3D-1Y", name: "Norton 360 Deluxe 3-Geräte 1 Jahr", category: "Antivirus", brand: "Norton", costPrice: 8.00, sellPrice: 19.99, stockLevel: 50, description: "Norton 360 Deluxe für 3 Geräte mit VPN, Passwort-Manager und 25 GB Cloud-Backup. Schutz für die kleine Familie." },
  { sku: "NORTON-360-DLX-5D-1Y", name: "Norton 360 Deluxe — 5 Geräte, 1 Jahr", category: "Antivirus", brand: "Norton", costPrice: 11.75, sellPrice: 24.99, stockLevel: 40, description: "Norton 360 Deluxe für bis zu 5 Geräte. VPN, Passwort-Manager, Kindersicherung und 50 GB Cloud-Backup." },
  { sku: "NORTON-360-PREM-10D-1Y", name: "Norton 360 Premium — 10 Geräte, 1 Jahr", category: "Antivirus", brand: "Norton", costPrice: 14.40, sellPrice: 34.99, stockLevel: 30, description: "Norton 360 Premium mit Schutz für bis zu 10 Geräte, 75 GB Cloud-Backup und Kindersicherung. Die Familien-Lösung." },
  // McAfee
  { sku: "MCAFEE-TP-3PC-1Y", name: "McAfee Total Protection 1-PC 1 Jahr", category: "Antivirus", brand: "McAfee", costPrice: 7.80, sellPrice: 14.99, stockLevel: 50, description: "Umfassender Schutz vor Viren, Malware und Online-Bedrohungen. Echtzeitschutz, sichere VPN und Passwort-Manager." },
  { sku: "MCAFEE-TP-UNL-1Y", name: "McAfee Total Protection 10-PC 1 Jahr", category: "Antivirus", brand: "McAfee", costPrice: 11.80, sellPrice: 24.99, stockLevel: 40, description: "Schützen Sie bis zu 10 Geräte mit einem Abonnement. Antivirus, VPN, Identitätsschutz und Firewall inklusive." },
  { sku: "MCAFEE-LIVESAFE-UNL-1Y", name: "McAfee LiveSafe Unbegrenzte Geräte 1 Jahr", category: "Antivirus", brand: "McAfee", costPrice: 14.80, sellPrice: 29.99, stockLevel: 30, description: "Schützen Sie alle Ihre Geräte ohne Limit. Premium-Lösung mit Antivirus, VPN und Identitätsschutz." },
  // Bitdefender
  { sku: "BITDEF-TS-5D-1Y", name: "Bitdefender Total Security 5-Geräte 1 Jahr", category: "Antivirus", brand: "Bitdefender", costPrice: 29.00, sellPrice: 44.99, stockLevel: 30, description: "Nr. 1 in unabhängigen AV-Tests. Umfassender Schutz für Windows, macOS, iOS und Android mit VPN und Kindersicherung." },
  { sku: "BITDEF-TS-10D-1Y", name: "Bitdefender Total Security 10-Geräte 1 Jahr", category: "Antivirus", brand: "Bitdefender", costPrice: 29.00, sellPrice: 44.99, stockLevel: 25, description: "Preisgekrönter Schutz für die ganze Familie. 10 Geräte, alle Plattformen, mit VPN und Anti-Ransomware." },
  { sku: "BITDEF-FAMILY-15D-1Y", name: "Bitdefender Family Pack 15-Geräte 1 Jahr", category: "Antivirus", brand: "Bitdefender", costPrice: 30.00, sellPrice: 49.99, stockLevel: 20, description: "Das ultimative Familien-Paket: 15 Geräte schützen mit Bitdefenders bestem Schutz. Ideal für Großfamilien." },
  // Trend Micro
  { sku: "TREND-MAXSEC-5PC-1Y", name: "Trend Micro Maximum Security 5-PC 1 Jahr", category: "Antivirus", brand: "Trend Micro", costPrice: 8.20, sellPrice: 16.99, stockLevel: 40, description: "Fortschrittlicher Schutz vor Ransomware, Phishing und Online-Betrug für bis zu 5 Geräte." },
  { sku: "TREND-MAXSEC-3PC-2Y", name: "Trend Micro Maximum Security 3-PC 2 Jahre", category: "Antivirus", brand: "Trend Micro", costPrice: 7.50, sellPrice: 14.99, stockLevel: 35, description: "2 Jahre sorgenfreier Schutz für 3 Geräte. Die günstigste 2-Jahres-Lösung für Einzelpersonen." },
] as const;

function createShuffleBagSlots(): number[] {
  const size = Math.floor(Math.random() * 7) + 7; // 7–13
  const winnerIndex = Math.floor(Math.random() * size);
  return Array.from({ length: size }, (_, i) => (i === winnerIndex ? 1 : 0));
}

async function main(): Promise<void> {
  console.log("🌱 Seeding products...");

  for (const p of products) {
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
      create: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        category: p.category,
        brand: p.brand,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        minimumMargin,
        stockLevel: p.stockLevel,
      },
    });

    console.log(`  ✅ ${p.sku} — ${p.name}`);
  }

  // Create initial ShuffleBag if none exists
  const activeBag = await prisma.shuffleBag.findFirst({ where: { isActive: true } });

  if (!activeBag) {
    const slots = createShuffleBagSlots();
    const slotsHash = createHash("sha256").update(JSON.stringify(slots)).digest("hex");

    await prisma.shuffleBag.create({
      data: { slots, currentIndex: 0, isActive: true, slotsHash },
    });

    console.log(`  🎲 ShuffleBag erstellt (${slots.length} Slots, Hash: ${slotsHash.slice(0, 12)}…)`);
  } else {
    console.log(`  🎲 ShuffleBag existiert bereits (ID: ${activeBag.id.slice(0, 8)}…)`);
  }

  console.log("✅ Seed abgeschlossen.");
}

main()
  .catch((e: unknown) => {
    console.error("❌ Seed fehlgeschlagen:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
