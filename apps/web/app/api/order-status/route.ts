import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { rateLimit } from "../../../lib/rate-limit";
import { RATE_LIMIT_WINDOW_MS } from "../../../lib/constants";

/**
 * GET /api/order-status?sessionId=cs_xxx&email=...
 *
 * Polled by the success-page client component while the Stripe webhook is
 * still in-flight. We hit Prisma directly here (not the orders service)
 * because we need the refund/delivery columns the customer-facing service
 * intentionally does not surface elsewhere.
 *
 * Security: Both sessionId AND customerEmail are required. Without the
 * email gate an attacker can enumerate orders by guessing `cs_*` IDs and
 * exfiltrate license keys + refund status. Comparison is case-insensitive
 * and timing-safe-ish (all returns happen the same way).
 */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = rateLimit(ip, { maxRequests: 10, windowMs: RATE_LIMIT_WINDOW_MS });
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const emailParam = searchParams.get("email")?.trim().toLowerCase();

  if (!sessionId || !emailParam) {
    return NextResponse.json(
      { error: "sessionId und email sind erforderlich" },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    select: {
      id: true,
      isWinner: true,
      refundStatus: true,
      status: true,
      amountTotal: true,
      licenseKey: true,
      deliveredAt: true,
      customerEmail: true,
      product: { select: { name: true } },
    },
  });

  // Same generic 404 whether the order doesn't exist OR the email doesn't
  // match — so we don't leak which sessionIds are real.
  if (!order || order.customerEmail.trim().toLowerCase() !== emailParam) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: order.status,
    isWinner: order.isWinner,
    refundStatus: order.refundStatus,
    productName: order.product.name,
    licenseKey: order.licenseKey,
    deliveredAt: order.deliveredAt,
  });
}
