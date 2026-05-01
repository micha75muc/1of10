import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../lib/auth";

/**
 * GET /api/admin/analytics
 * Dashboard-Metriken aus der DB.
 */
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    totalRevenue,
    winnerCount,
    todayOrders,
    weekOrders,
    monthOrders,
    pendingApprovals,
    topProducts,
    recentWinners,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { amountTotal: true } }),
    prisma.order.count({ where: { isWinner: true } }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.approvalItem.count({ where: { status: "PENDING" } }),
    prisma.order.groupBy({
      by: ["productId"],
      _count: true,
      _sum: { amountTotal: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { isWinner: true, refundStatus: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        createdAt: true,
        amountTotal: true,
        product: { select: { name: true } },
      },
    }),
  ]);

  const revenue = Number(totalRevenue._sum.amountTotal ?? 0);
  const refundEstimate = winnerCount > 0 ? revenue * (winnerCount / Math.max(totalOrders, 1)) : 0;

  // Product margin analysis
  const allProducts = await prisma.product.findMany({
    select: { sku: true, name: true, costPrice: true, sellPrice: true, stockLevel: true },
  });
  const productMargins = allProducts.map((p) => {
    const cost = Number(p.costPrice);
    const sell = Number(p.sellPrice);
    const marginPct = sell > 0 ? (sell - cost) / sell * 100 : 0;
    const afterRefund = marginPct - 10;
    return { sku: p.sku, name: p.name, costPrice: cost, sellPrice: sell, margin: `${marginPct.toFixed(1)}%`, marginAfterRefund: `${afterRefund.toFixed(1)}%`, healthy: afterRefund > 15, stockLevel: p.stockLevel };
  });

  return NextResponse.json({
    overview: {
      totalOrders,
      totalRevenue: revenue,
      totalRefunds: refundEstimate,
      netRevenue: revenue - refundEstimate,
      winnerCount,
      winnerRate: totalOrders > 0 ? winnerCount / totalOrders : 0,
    },
    today: { orders: todayOrders },
    thisWeek: { orders: weekOrders },
    thisMonth: { orders: monthOrders },
    topProducts,
    recentWinners: recentWinners.map((w) => ({
      date: w.createdAt,
      product: w.product.name,
      amount: Number(w.amountTotal),
    })),
    pendingApprovals,
    productMargins,
    marginWarnings: productMargins.filter((p) => !p.healthy).map((p) => `${p.sku}: Marge nach Erstattung nur ${p.marginAfterRefund}`),
  });
}
