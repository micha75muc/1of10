import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { stripe } from "../../../../lib/stripe";
import { sendEmail, orderConfirmationEmail } from "../../../../lib/email";
import { drawFromShuffleBag } from "../../../../lib/shuffle-bag";
import { rateLimit } from "../../../../lib/rate-limit";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    // Rate limit webhooks (Stripe retries are max 3/event, so 30/min is generous)
    const ip = req.headers.get("x-forwarded-for") ?? "stripe";
    const { ok } = rateLimit(ip, { maxRequests: 30, windowMs: 60_000 });
    if (!ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Verify Stripe webhook signature — prevents fake webhook calls
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error("[Webhook] Missing signature or webhook secret");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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

    if (!sessionId || !productId || !customerEmail || !amountTotal) {
      return NextResponse.json(
        { error: "Missing required session data" },
        { status: 400 }
      );
    }

    // Idempotency check — prevent duplicate processing
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
    });

    if (existingOrder) {
      return NextResponse.json({
        received: true,
        message: "Order already processed",
        orderId: existingOrder.id,
      });
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
        console.error("[Webhook] Refund failed:", refundErr);
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

    // Send confirmation email
    const emailParams = orderConfirmationEmail({
      customerEmail,
      productName: order.product.name,
      amountTotal,
      isWinner,
    });
    await sendEmail(emailParams);

    console.log(
      `[Webhook] Order ${order.id} created. Winner: ${isWinner}`
    );

    return NextResponse.json({ received: true, orderId: order.id });
  } catch (err) {
    console.error("[Webhook] Error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
