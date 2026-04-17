import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { rateLimit } from "../../../lib/rate-limit";

/**
 * GET /api/order-status?sessionId=cs_xxx
 * Gibt den Erstattungskunde-Status einer Bestellung zurück.
 */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = rateLimit(ip, { maxRequests: 10, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
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
      product: { select: { name: true } },
    },
  });

  if (!order) {
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
