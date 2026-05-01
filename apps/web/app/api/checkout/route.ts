import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { stripe } from "../../../lib/stripe";
import { rateLimit } from "../../../lib/rate-limit";
import { RATE_LIMIT_WINDOW_MS } from "../../../lib/constants";
import { logError } from "../../../lib/error-logger";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const maxReq = process.env.TEST_MODE === "true" ? 50 : 5;
    const { ok } = rateLimit(ip, { maxRequests: maxReq, windowMs: RATE_LIMIT_WINDOW_MS });
    if (!ok) {
      return NextResponse.json({ error: "Zu viele Anfragen. Bitte warte kurz." }, { status: 429 });
    }

    const body = await req.json();
    const {
      productId,
      customerEmail,
      dsgvoOptIn,
      bgbWiderrufOptIn,
      // Optional in TEST_MODE: lets the dummy E2E supply a name/address/phone
      // that real Stripe would normally collect via billing_address_collection.
      customerName,
      customerPhone,
      customerAddress,
    } = body as {
      productId?: string;
      customerEmail?: string;
      dsgvoOptIn?: boolean;
      bgbWiderrufOptIn?: boolean;
      customerName?: string;
      customerPhone?: string;
      customerAddress?: {
        line1?: string;
        line2?: string | null;
        city?: string;
        postal_code?: string;
        country?: string;
        state?: string | null;
      };
    };

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

    // Defense in depth: even if a product without a DSD code somehow makes
    // it past the catalog filter (manual link, cached page, …), refuse the
    // checkout instead of creating an order we can't fulfil.
    if (!product.dsdProductCode) {
      return NextResponse.json(
        { error: "Dieses Produkt ist aktuell nicht bestellbar." },
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
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      metadata: {
        productId: product.id,
        dsgvoOptIn: String(dsgvoOptIn),
        bgbWiderrufOptIn: String(bgbWiderrufOptIn),
      },
    });

    // Mock + TEST_MODE: simulate a real Stripe webhook fire so the order
    // actually gets created and the success page can render. Without this,
    // mock checkout would always show OrderPending. Real Stripe (sk_test_*)
    // does the same via the standard webhook path.
    if (
      process.env.STRIPE_MOCK === "true" &&
      process.env.TEST_MODE === "true"
    ) {
      const synthEvent = {
        id: `evt_mock_${Date.now()}`,
        type: "checkout.session.completed",
        data: {
          object: {
            id: session.id,
            metadata: {
              productId: product.id,
              dsgvoOptIn: String(dsgvoOptIn),
              bgbWiderrufOptIn: String(bgbWiderrufOptIn),
            },
            customer_email: customerEmail,
            amount_total: Math.round(Number(product.sellPrice) * 100),
            payment_intent: `pi_mock_${Date.now()}`,
            customer_details: {
              name: customerName ?? "Test Kunde",
              phone: customerPhone ?? "+491700000000",
              address: customerAddress ?? {
                line1: "Teststrasse 1",
                line2: null,
                city: "Berlin",
                postal_code: "10115",
                country: "DE",
                state: null,
              },
            },
          },
        },
      };

      // Fire the webhook synchronously so the order is committed before we
      // return the success URL to the client. Failure here surfaces as 500
      // so the operator sees the issue immediately during dummy runs.
      const hookUrl = `${appUrl}/api/webhooks/stripe`;
      const hookRes = await fetch(hookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-internal": "1",
        },
        body: JSON.stringify(synthEvent),
      });
      if (!hookRes.ok) {
        const txt = await hookRes.text().catch(() => "");
        throw new Error(
          `mock webhook fire failed: ${hookRes.status} ${txt.slice(0, 800)}`,
        );
      }
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    // Generate a short error-id customers can quote when contacting support
    const errorId =
      "CHK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    console.error(
      JSON.stringify({
        level: "error",
        event: "api.checkout.failed",
        errorId,
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      }),
    );
    return NextResponse.json(
      {
        error:
          "Wir konnten dich gerade nicht zur Bezahlung weiterleiten. Bitte versuche es in einer Minute erneut. Wenn das Problem bestehen bleibt, schreib uns an info@medialess.de — bitte gib diese Fehler-ID an: " +
          errorId,
        errorId,
        // Detailed server error exposed only in TEST_MODE so the operator can
        // debug dummy-purchase failures via the API directly.
        ...(process.env.TEST_MODE === "true"
          ? {
              _testModeDebug: {
                message: err instanceof Error ? err.message : String(err),
                stack:
                  err instanceof Error
                    ? err.stack?.split("\n").slice(0, 12)
                    : undefined,
              },
            }
          : {}),
      },
      { status: 500 },
    );
  }
}
