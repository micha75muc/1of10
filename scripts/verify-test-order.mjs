import pkg from "@prisma/client";
const { PrismaClient } = pkg;

/**
 * Usage: node scripts/verify-test-order.mjs <customerEmail>
 *
 * Lädt die letzte Order für eine Test-Email, dumpt alle E2E-relevanten
 * Felder und prüft die erwarteten Status-Übergänge (Winner vs Non-Winner).
 */
const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/verify-test-order.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

const order = await prisma.order.findFirst({
  where: { customerEmail: email },
  orderBy: { createdAt: "desc" },
  include: { product: { select: { sku: true, name: true, stockLevel: true } } },
});

if (!order) {
  console.error(`❌ Keine Order für ${email}`);
  process.exit(2);
}

const activeBag = await prisma.shuffleBag.findFirst({ where: { isActive: true } });
const latestBag = await prisma.shuffleBag.findFirst({ orderBy: { createdAt: "desc" } });

console.log("\n=== ORDER ===");
console.log("id:", order.id);
console.log("customerEmail:", order.customerEmail);
console.log("stripeSessionId:", order.stripeSessionId);
console.log("status:", order.status);
console.log("isWinner:", order.isWinner);
console.log("refundStatus:", order.refundStatus);
console.log("licenseKey:", order.licenseKey);
console.log("dsdCertificateId:", order.dsdCertificateId);
console.log("deliveredAt:", order.deliveredAt);
console.log("deliveryError:", order.deliveryError);
console.log("amount:", order.amount, order.currency);
console.log("createdAt:", order.createdAt);

console.log("\n=== PRODUCT ===");
console.log("sku:", order.product.sku);
console.log("stockLevel nach Kauf:", order.product.stockLevel);

console.log("\n=== SHUFFLE-BAG STATUS ===");
if (activeBag) {
  console.log("aktiver Bag:", activeBag.id, "currentIndex:", activeBag.currentIndex, "von", activeBag.slots.length);
} else {
  console.log("Kein aktiver Bag (exhaustion).");
  if (latestBag) {
    console.log("letzter Bag:", latestBag.id, "currentIndex:", latestBag.currentIndex, "/", latestBag.slots.length);
  }
}

console.log("\n=== ERWARTUNG ===");
const expectedNonWinner = {
  isWinner: false,
  refundStatus: null,
  status: "DELIVERED",
  licenseKey: "MOCK-xxxx-XXXX-XXXX (gesetzt)",
  deliveredAt: "≠ null",
};
const expectedWinner = {
  isWinner: true,
  refundStatus: "COMPLETED",
  status: "REFUNDED",
  licenseKey: "MOCK-xxxx-XXXX-XXXX (gesetzt)",
  deliveredAt: "≠ null",
};

console.log(order.isWinner ? "WINNER-Pfad:" : "NON-WINNER-Pfad:");
console.log(order.isWinner ? expectedWinner : expectedNonWinner);

const checks = [];
if (order.isWinner) {
  checks.push(["refundStatus=COMPLETED", order.refundStatus === "COMPLETED"]);
  checks.push(["status=REFUNDED", order.status === "REFUNDED"]);
} else {
  checks.push(["refundStatus=null", order.refundStatus === null]);
  checks.push(["status=DELIVERED", order.status === "DELIVERED"]);
}
checks.push(["licenseKey gesetzt", !!order.licenseKey]);
checks.push(["deliveredAt gesetzt", !!order.deliveredAt]);
checks.push(["deliveryError leer", !order.deliveryError]);

console.log("\n=== CHECKS ===");
let allPass = true;
for (const [name, ok] of checks) {
  console.log(`${ok ? "✅" : "❌"} ${name}`);
  if (!ok) allPass = false;
}

await prisma.$disconnect();
process.exit(allPass ? 0 : 3);
