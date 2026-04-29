import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { rateLimit } from "../../../../../lib/rate-limit";
import { sendEmail, orderConfirmationEmail } from "../../../../../lib/email";

/**
 * Re-send the order confirmation email. Auth pattern: caller must supply
 * the original Stripe session_id matching the order. Rate-limited per IP
 * (3 calls / 5 min) to prevent abuse.
 *
 * Why not require email login: the customer is already authenticated by
 * possession of the session_id (delivered out-of-band via the original
 * Stripe redirect / confirmation page). We do NOT leak whether the order
 * exists — a wrong session_id returns the same generic 404 as a missing
 * order.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { ok } = rateLimit(`resend:${ip}`, {
      maxRequests: 3,
      windowMs: 300_000,
    });
    if (!ok) {
      return NextResponse.json(
        {
          error:
            "Zu viele Anfragen. Bitte warte 5 Minuten bevor du es erneut versuchst.",
        },
        { status: 429 },
      );
    }

    const { orderId } = await params;
    const body = (await req.json().catch(() => ({}))) as { sessionId?: string };
    const sessionId = body.sessionId?.trim();

    if (!orderId || !sessionId) {
      return NextResponse.json(
        { error: "Bestellung konnte nicht zugeordnet werden." },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, stripeSessionId: sessionId },
      include: { product: true },
    });

    // Generic 404 — bewusst KEIN Hinweis ob die ID existiert
    if (!order) {
      return NextResponse.json(
        { error: "Bestellung nicht gefunden." },
        { status: 404 },
      );
    }

    const emailParams = orderConfirmationEmail({
      customerEmail: order.customerEmail,
      productName: order.product.name,
      amountTotal: Number(order.amountTotal) * 100,
      isWinner: order.isWinner,
      licenseKey: order.licenseKey ?? undefined,
      requiresVendorAccount: order.product.requiresVendorAccount,
      vendorName: order.product.vendorName ?? undefined,
      vendorActivationUrl: order.product.vendorActivationUrl ?? undefined,
    });

    await sendEmail(emailParams);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "api.orders.resend.failed",
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      }),
    );
    return NextResponse.json(
      {
        error:
          "Wir konnten die Mail gerade nicht erneut senden. Bitte versuche es später erneut.",
      },
      { status: 500 },
    );
  }
}
