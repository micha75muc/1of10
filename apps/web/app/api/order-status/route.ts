import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * GET /api/order-status?sessionId=cs_xxx
 * Gibt den Erstattungskunde-Status einer Bestellung zurück.
 * Rate-limited: 10 req/min per IP.
 */
export async function GET(req: Request) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const windowMs = 60_000;
  const maxReq = 10;
  const key = `orderstatus:${ip}`;
  const g = globalThis as unknown as { __osRL?: Map<string, number[]> };
  if (!g.__osRL) g.__osRL = new Map();
  const hits = (g.__osRL.get(key) ?? []).filter(t => t > now - windowMs);
  if (hits.length >= maxReq) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  hits.push(now);
  g.__osRL.set(key, hits);

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
  });
}
