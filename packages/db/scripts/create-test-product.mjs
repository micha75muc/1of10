import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const p = await prisma.product.upsert({
  where: { sku: "TEST-PRODUCT-050" },
  create: {
    sku: "TEST-PRODUCT-050",
    name: "TEST Testprodukt (nicht kaufen)",
    description: "⚠️ Internes Testprodukt — nicht für echte Käufe. Nur zur Verifizierung des Checkout-Flows. Du erhältst einen Mock-Lizenzschlüssel.",
    category: "Test",
    brand: "1of10",
    costPrice: 0.0,
    sellPrice: 0.5,
    minimumMargin: 0.0,
    stockLevel: 100,
  },
  update: { sellPrice: 0.5, stockLevel: 100 },
});
console.log("✅", p.sku, "| €" + p.sellPrice, "| stock", p.stockLevel);
await prisma.$disconnect();
