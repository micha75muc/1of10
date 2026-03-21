import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

const products = [
  { sku: "WIN-11-PRO", name: "Microsoft Windows 11 Professional", costPrice: 8.50, sellPrice: 14.99, stockLevel: 100 },
  { sku: "WIN-11-HOME", name: "Microsoft Windows 11 Home", costPrice: 6.50, sellPrice: 11.99, stockLevel: 80 },
  { sku: "MS-365-BUS-STD", name: "Microsoft 365 Business Standard", costPrice: 10.20, sellPrice: 12.90, stockLevel: 50 },
  { sku: "MS-365-BUS-PREM", name: "Microsoft 365 Business Premium", costPrice: 18.00, sellPrice: 22.00, stockLevel: 30 },
  { sku: "MS-OFFICE-2024-PRO", name: "Microsoft Office 2024 Professional Plus", costPrice: 22.00, sellPrice: 29.99, stockLevel: 45 },
  { sku: "ADOBE-CC-ALL", name: "Adobe Creative Cloud All Apps (1 Jahr)", costPrice: 45.00, sellPrice: 54.99, stockLevel: 25 },
  { sku: "NORTON-360-DLX", name: "Norton 360 Deluxe Antivirus (1 Jahr)", costPrice: 8.00, sellPrice: 14.99, stockLevel: 60 },
  { sku: "KASPERSKY-PLUS", name: "Kaspersky Plus Antivirus (1 Jahr)", costPrice: 7.50, sellPrice: 12.99, stockLevel: 55 },
  { sku: "WIN-SRV-2022-STD", name: "Microsoft Windows Server 2022 Standard", costPrice: 120.00, sellPrice: 179.99, stockLevel: 15 },
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
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        minimumMargin,
        stockLevel: p.stockLevel,
      },
      create: {
        sku: p.sku,
        name: p.name,
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
