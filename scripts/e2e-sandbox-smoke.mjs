/**
 * E2E sandbox smoke test — sends a signed Stripe checkout.session.completed
 * webhook to https://1of10.de/api/webhooks/stripe and verifies the resulting
 * Order has a license_key + dsdCertificateId set via the DSD sandbox path.
 *
 * Pre-conditions:
 *  - Vercel TEST_MODE=false (so key-delivery actually calls the agent)
 *  - Hetzner agents container running with DSD_DELIVERY_ENABLED=true
 *  - DSD account medialess_apitest in sandbox mode (dummy keys)
 *  - STRIPE_SECRET_KEY is sk_test_... so charges are virtual
 *
 * Run: STRIPE_SECRET=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_... \
 *      node scripts/e2e-sandbox-smoke.mjs
 */
import crypto from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const STRIPE_SECRET = process.env.STRIPE_SECRET ?? process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SITE = process.env.SITE_URL ?? "https://1of10.de";

if (!STRIPE_SECRET || !WEBHOOK_SECRET) {
  console.error("Missing STRIPE_SECRET / STRIPE_WEBHOOK_SECRET env vars");
  process.exit(1);
}

const prisma = new PrismaClient();

// 1) Pick a product that has a REAL dsdProductCode (so the agent path is
//    exercised against the DSD sandbox, not our internal TEST-MOCK fixture)
const product = await prisma.product.findFirst({
  where: {
    dsdProductCode: { not: null, startsWith: "DSD" },
    stockLevel: { gt: 0 },
  },
  orderBy: { sellPrice: "asc" },
});

if (!product) {
  console.error("No product with dsdProductCode and stock > 0 found.");
  process.exit(2);
}
console.log("Using product:", product.sku, "(dsd:", product.dsdProductCode + ")");

// 2) Create a real Stripe Checkout Session via the API. With sk_test, no
//    money moves, but customer_details.name + phone come back populated as
//    if a real card had been used.
const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${STRIPE_SECRET}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    "mode": "payment",
    "success_url": `${SITE}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    "cancel_url": `${SITE}/products`,
    "customer_email": `e2e-${Date.now()}@1of10.de`,
    "metadata[productId]": product.id,
    "metadata[dsgvoOptIn]": "true",
    "metadata[bgbWiderrufOptIn]": "true",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(Math.round(Number(product.sellPrice) * 100)),
    "line_items[0][price_data][product_data][name]": product.name,
    "line_items[0][quantity]": "1",
    "billing_address_collection": "required",
    "phone_number_collection[enabled]": "true",
  }),
});
if (!stripeRes.ok) {
  console.error("Stripe session create failed:", await stripeRes.text());
  process.exit(3);
}
const session = await stripeRes.json();
console.log("Created session:", session.id);

// 3) Force-complete the session by injecting customer_details and triggering
//    the webhook ourselves (Stripe test mode normally fires the webhook only
//    after payment confirmation; we short-circuit it).
const completedSession = {
  ...session,
  customer_email: session.customer_email,
  amount_total: Math.round(Number(product.sellPrice) * 100),
  customer_details: {
    name: "E2E Sandbox Tester",
    phone: "+4915155088876",
    email: session.customer_email,
  },
};

const eventBody = JSON.stringify({
  id: `evt_e2e_${Date.now()}`,
  object: "event",
  type: "checkout.session.completed",
  created: Math.floor(Date.now() / 1000),
  data: { object: completedSession },
});

const ts = Math.floor(Date.now() / 1000);
const signedPayload = `${ts}.${eventBody}`;
const signature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(signedPayload).digest("hex");

const webhookRes = await fetch(`${SITE}/api/webhooks/stripe`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Stripe-Signature": `t=${ts},v1=${signature}`,
  },
  body: eventBody,
});
const webhookText = await webhookRes.text();
console.log("Webhook response:", webhookRes.status, webhookText.slice(0, 200));

// 4) Wait for the webhook to finish and check the resulting Order in DB
await wait(8000);

const order = await prisma.order.findUnique({
  where: { stripeSessionId: session.id },
  include: { product: { select: { sku: true } } },
});

if (!order) {
  console.error("❌ No order created in DB");
  process.exit(4);
}

console.log("\n=== ORDER ===");
console.log({
  id: order.id,
  status: order.status,
  isWinner: order.isWinner,
  refundStatus: order.refundStatus,
  licenseKey: order.licenseKey,
  dsdCertificateId: order.dsdCertificateId,
  deliveryError: order.deliveryError,
  deliveredAt: order.deliveredAt,
});

const passed =
  !!order.licenseKey &&
  !!order.dsdCertificateId &&
  !order.deliveryError &&
  // a real DSD sandbox key, not the local mock
  !order.licenseKey.startsWith("MOCK") &&
  !order.licenseKey.startsWith("DUMMY");

console.log(passed ? "\n✅ E2E SANDBOX FLOW PASSED" : "\n❌ E2E FAILED — see fields above");

await prisma.$disconnect();
process.exit(passed ? 0 : 5);
