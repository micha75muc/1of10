import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../lib/auth";

/**
 * GET /api/admin/health
 *
 * O2 — Operations Health-Check. Aggregierter Status-Snapshot für Admin.
 * Antwortet auch wenn einzelne Sub-Checks fehlschlagen — der Caller sieht
 * pro Sektion ob ok=true und kann gezielt eingreifen.
 *
 * Sektionen:
 *   - delivery: Anzahl Orders im Status DELIVERY_FAILED
 *   - email:    Anzahl Orders mit emailError gesetzt
 *   - bag:      Aktiver ShuffleBag (id, size, currentIndex, slotsHash) — ohne slots[]
 *   - orders:   Counts: today, last 24h, last 7d, total
 *   - refunds:  Anzahl Orders mit refundStatus=FAILED (Stripe-Retry nötig)
 *   - approvals: Anzahl ApprovalItems im Status PENDING
 *
 * Status-Code: 200 wenn alle Sektionen ok=true, 207 (Multi-Status) sonst.
 */
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const sections: Record<string, { ok: boolean; data?: unknown; error?: string }> = {};

  try {
    const failed = await prisma.order.count({ where: { status: "DELIVERY_FAILED" } });
    const failedRecent = await prisma.order.count({
      where: { status: "DELIVERY_FAILED", createdAt: { gte: last24h } },
    });
    sections.delivery = { ok: failed === 0, data: { totalFailed: failed, last24h: failedRecent } };
  } catch (err) {
    sections.delivery = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  try {
    const failedEmail = await prisma.order.count({ where: { emailError: { not: null } } });
    sections.email = { ok: failedEmail === 0, data: { failedEmail } };
  } catch (err) {
    sections.email = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  try {
    const failedRefund = await prisma.order.count({ where: { refundStatus: "FAILED" } });
    sections.refunds = { ok: failedRefund === 0, data: { failedRefund } };
  } catch (err) {
    sections.refunds = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  try {
    const bag = await prisma.shuffleBag.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, slots: true, currentIndex: true, slotsHash: true, createdAt: true },
    });
    sections.bag = {
      ok: bag !== null,
      data: bag
        ? {
            id: bag.id,
            size: bag.slots.length,
            currentIndex: bag.currentIndex,
            remaining: bag.slots.length - bag.currentIndex,
            slotsHash: bag.slotsHash,
            createdAt: bag.createdAt,
          }
        : null,
    };
  } catch (err) {
    sections.bag = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  try {
    const [todayCount, last24hCount, last7dCount, totalCount] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { createdAt: { gte: last24h } } }),
      prisma.order.count({ where: { createdAt: { gte: last7d } } }),
      prisma.order.count(),
    ]);
    sections.orders = {
      ok: true,
      data: { today: todayCount, last24h: last24hCount, last7d: last7dCount, total: totalCount },
    };
  } catch (err) {
    sections.orders = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  try {
    const pendingApprovals = await prisma.approvalItem.count({ where: { status: "PENDING" } });
    sections.approvals = { ok: true, data: { pending: pendingApprovals } };
  } catch (err) {
    sections.approvals = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  const allOk = Object.values(sections).every((s) => s.ok);
  return NextResponse.json(
    { ok: allOk, checkedAt: now.toISOString(), sections },
    { status: allOk ? 200 : 207 },
  );
}
