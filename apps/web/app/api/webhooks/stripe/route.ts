import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { stripe } from "../../../../lib/stripe";
import { sendEmail, orderConfirmationEmail } from "../../../../lib/email";
import { drawFromShuffleBag } from "../../../../lib/shuffle-bag";
import { rateLimit } from "../../../../lib/rate-limit";
import { deliverLicenseKey } from "../../../../lib/key-delivery";
import { RATE_LIMIT_WINDOW_MS } from "../../../../lib/constants";
import { logEvent, logWarn, logError } from "../../../../lib/error-logger";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    // Rate limit webhooks (Stripe retries are max 3/event, so 30/min is generous)
    const ip = req.headers.get("x-forwarded-for") ?? "stripe";
    const { ok } = rateLimit(ip, { maxRequests: 30, windowMs: RATE_LIMIT_WINDOW_MS });
    if (!ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Verify Stripe webhook signature — prevents fake webhook calls
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      logWarn("webhook.signature.missing");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      logError(err, { event: "webhook.signature.invalid" });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "charge.dispute.created") {
      // Handle disputes — mark order as disputed
      const dispute = event.data.object as { payment_intent?: string };
      if (dispute.payment_intent) {
        const piId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : "";
        // Find order by payment intent via Stripe session lookup
        logWarn("webhook.dispute.created", { paymentIntent: piId });
      }
      return NextResponse.json({ received: true });
    }

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    const sessionId = session.id;
    const metadata = session.metadata ?? {};
    const customerEmail = session.customer_email;
    const amountTotal = session.amount_total;
    const productId = metadata.productId;
    // Stripe collects these via customer_creation/billing_address_collection.
    // first/last name parsed below for DSD quickOrder client_mandatory fields.
    const customerName = session.customer_details?.name ?? undefined;
    const customerPhone = session.customer_details?.phone ?? undefined;

    if (!sessionId || !productId || !customerEmail || !amountTotal) {
      return NextResponse.json(
        { error: "Missing required session data" },
        { status: 400 }
      );
    }

    // Idempotency — use upsert with unique constraint to prevent race condition
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
    });

    if (existingOrder) {
      // Already processed — check if refund needs retry
      if (existingOrder.isWinner && existingOrder.refundStatus === "FAILED") {
        logEvent("webhook.refund.retry", { orderId: existingOrder.id });
        // Retry refund on duplicate webhook
        if (session.payment_intent) {
          try {
            const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
            await stripe.refunds.create({ payment_intent: piId, metadata: { orderId: existingOrder.id, reason: "kulanz_erstattung_retry" } });
            await prisma.order.update({ where: { id: existingOrder.id }, data: { refundStatus: "COMPLETED", status: "REFUNDED" } });
          } catch (retryErr) {
            logError(retryErr, { event: "webhook.refund.retry.failed", orderId: existingOrder.id });
          }
        }
      }
      return NextResponse.json({ received: true, message: "Order already processed", orderId: existingOrder.id });
    }

    // 🎲 Shuffle Bag — garantiert: jeder 10. Kauf ist kostenlos
    const isWinner = await drawFromShuffleBag();

    // Create order
    const order = await prisma.order.create({
      data: {
        stripeSessionId: sessionId,
        productId,
        customerEmail,
        amountTotal: amountTotal / 100, // Convert from cents
        status: "PAID",
        bgbWiderrufOptIn: metadata.bgbWiderrufOptIn === "true",
        dsgvoOptIn: metadata.dsgvoOptIn === "true",
        isWinner,
        refundStatus: isWinner ? "INITIATED" : null,
      },
      include: { product: true },
    });

    // If winner → initiate refund
    if (isWinner && session.payment_intent) {
      try {
        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent.id;
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: amountTotal ?? undefined,
          metadata: { orderId: order.id, reason: "kulanz_erstattung" },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { refundStatus: "COMPLETED", status: "REFUNDED" },
        });
      } catch (refundErr) {
        logError(refundErr, { event: "webhook.refund.failed", orderId: order.id });
        await prisma.order.update({
          where: { id: order.id },
          data: { refundStatus: "FAILED" },
        });
      }
    }

    // Decrement stock
    await prisma.product.update({
      where: { id: productId },
      data: { stockLevel: { decrement: 1 } },
    });

    // 🔑 E9 Key Delivery — activate product at DSD and store license key.
    // Winners still get the key (they keep the product, refund is on top).
    // Orders without a dsdProductCode fall back to manual fulfilment.
    let licenseKey: string | undefined;
    if (order.product.dsdProductCode) {
      const nameParts = (customerName ?? "").trim().split(/\s+/);
      const firstName = nameParts.length >= 1 ? nameParts[0] : undefined;
      const lastName = nameParts.length >= 2 ? nameParts.slice(1).join(" ") : undefined;
      const delivery = await deliverLicenseKey({
        productCode: order.product.dsdProductCode,
        customerEmail,
        reference: order.id,
        customerName,
        firstName,
        lastName,
        phone: customerPhone,
        mandatoryFields: order.product.dsdMandatoryClientFields,
      });
      if (delivery.ok && delivery.licenseKey) {
        licenseKey = delivery.licenseKey;
        await prisma.order.update({
          where: { id: order.id },
          data: {
            licenseKey: delivery.licenseKey,
            dsdCertificateId: delivery.certificateId ?? null,
            deliveredAt: new Date(),
            // Winners keep REFUNDED status; non-winners move to DELIVERED
            status: isWinner ? "REFUNDED" : "DELIVERED",
          },
        });
      } else {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            deliveryError: delivery.error ?? "Unknown delivery error",
            status: isWinner ? "REFUNDED" : "DELIVERY_FAILED",
          },
        });
        logError(delivery.error ?? "Unknown delivery error", {
          event: "webhook.delivery.failed",
          orderId: order.id,
          productCode: order.product.dsdProductCode,
        });
      }
    } else {
      logWarn("webhook.delivery.skipped", {
        orderId: order.id,
        productId,
        reason: "no_dsdProductCode",
      });
    }

    // Send confirmation email (includes license key if we got one)
    const emailParams = orderConfirmationEmail({
      customerEmail,
      productName: order.product.name,
      amountTotal,
      isWinner,
      licenseKey,
      requiresVendorAccount: order.product.requiresVendorAccount,
      vendorName: order.product.vendorName ?? undefined,
      vendorActivationUrl: order.product.vendorActivationUrl ?? undefined,
    });
    await sendEmail(emailParams);

    logEvent("webhook.order.created", {
      orderId: order.id,
      productId,
      isWinner,
      amount: amountTotal,
    });

    return NextResponse.json({ received: true, orderId: order.id });
  } catch (err) {
    logError(err, { event: "webhook.processing.failed" });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
