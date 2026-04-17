import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { stripe } from "../../../lib/stripe";
import { rateLimit } from "../../../lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const maxReq = process.env.TEST_MODE === "true" ? 50 : 5;
    const { ok } = rateLimit(ip, { maxRequests: maxReq, windowMs: 60_000 });
    if (!ok) {
      return NextResponse.json({ error: "Zu viele Anfragen. Bitte warte kurz." }, { status: 429 });
    }

    const body = await req.json();
    const { productId, customerEmail, dsgvoOptIn, bgbWiderrufOptIn } = body;

    // Server-side validation — compliance is non-negotiable
    if (!dsgvoOptIn || !bgbWiderrufOptIn) {
      return NextResponse.json(
        {
          error:
            "Beide Zustimmungen (AGB/DSGVO und BGB-Widerrufsverzicht) sind erforderlich.",
        },
        { status: 400 }
      );
    }

    if (!productId || !customerEmail) {
      return NextResponse.json(
        { error: "productId und customerEmail sind erforderlich." },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json(
        { error: "Ungültige E-Mail-Adresse." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden." },
        { status: 404 }
      );
    }

    if (product.stockLevel <= 0) {
      return NextResponse.json(
        { error: "Produkt ist ausverkauft." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10.de";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            unit_amount: Math.round(Number(product.sellPrice) * 100),
            currency: "eur",
            product_data: { name: product.name },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/products`,
      customer_email: customerEmail,
      metadata: {
        productId: product.id,
        dsgvoOptIn: String(dsgvoOptIn),
        bgbWiderrufOptIn: String(bgbWiderrufOptIn),
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[Checkout API] Error:", err);
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
