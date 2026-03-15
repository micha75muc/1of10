import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { stripe } from "../../../../lib/stripe";
import { sendEmail, orderConfirmationEmail } from "../../../../lib/email";
import { drawFromShuffleBag } from "../../../../lib/shuffle-bag";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // In production with real Stripe, verify webhook signature here:
    // const sig = req.headers.get("stripe-signature");
    // const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    const event = body;

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data?.object ?? event;

    const sessionId = session.id ?? session.stripeSessionId;
    const metadata = session.metadata ?? {};
    const customerEmail = session.customer_email ?? session.customerEmail;
    const amountTotal = session.amount_total ?? session.amountTotal;
    const productId = metadata.productId;

    if (!sessionId || !productId || !customerEmail) {
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
    if (isWinner) {
      try {
        await stripe.refunds.create({
          payment_intent: session.payment_intent,
          amount: amountTotal,
          metadata: { orderId: order.id, reason: "gamified_refund" },
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

    return NextResponse.json({
      received: true,
      orderId: order.id,
      isWinner,
    });
  } catch (err) {
    console.error("[Webhook] Error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
