import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * GET /api/order-status?sessionId=cs_xxx
 * Gibt den Gewinner-Status einer Bestellung zurück.
 * Öffentlich zugänglich (nur via stripeSessionId — kein Auth nötig).
 */
export async function GET(req: Request) {
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
    orderId: order.id,
    isWinner: order.isWinner,
    refundStatus: order.refundStatus,
    status: order.status,
    amount: Number(order.amountTotal),
    productName: order.product.name,
  });
}
