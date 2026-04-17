import pkg from "@prisma/client";
const { PrismaClient } = pkg;

/**
 * Cleanup nach E2E-Tests:
 *  1. Löscht alle Orders mit customerEmail LIKE 'test+%@1of10.de'
 *  2. Setzt TEST-PRODUCT-050 Stock zurück auf 100
 *  3. Deaktiviert alle aktiven Shuffle-Bags (der nächste Live-Kauf erzeugt einen frischen)
 *
 * Lauf: node scripts/cleanup-test-orders.mjs
 */
const prisma = new PrismaClient();

console.log("🧹 Cleanup Test-Orders …");

const ordersToDelete = await prisma.order.findMany({
  where: { customerEmail: { startsWith: "test+", endsWith: "@1of10.de" } },
  select: { id: true, customerEmail: true, stripeSessionId: true, status: true, isWinner: true },
});

console.log(`Gefunden: ${ordersToDelete.length} Test-Orders`);
for (const o of ordersToDelete) {
  console.log(`  - ${o.customerEmail} (${o.status}, winner=${o.isWinner}, ${o.stripeSessionId})`);
}

if (ordersToDelete.length > 0) {
  const del = await prisma.order.deleteMany({
    where: { id: { in: ordersToDelete.map((o) => o.id) } },
  });
  console.log(`✅ ${del.count} Orders gelöscht`);
}

const product = await prisma.product.update({
  where: { sku: "TEST-PRODUCT-050" },
  data: { stockLevel: 100 },
});
console.log(`✅ ${product.sku} Stock zurückgesetzt auf ${product.stockLevel}`);

const bagUpdate = await prisma.shuffleBag.updateMany({
  where: { isActive: true },
  data: { isActive: false },
});
console.log(`✅ ${bagUpdate.count} aktive Shuffle-Bag(s) deaktiviert`);

await prisma.$disconnect();
console.log("🎉 Cleanup abgeschlossen.");
