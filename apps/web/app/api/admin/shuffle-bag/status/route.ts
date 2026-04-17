import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../../lib/auth";

/**
 * GET /api/admin/shuffle-bag/status
 *
 * Liefert den aktuell aktiven Shuffle-Bag + die letzten 10 Bags.
 *
 * Auth: Header `x-admin-api-key: ${ADMIN_API_KEY}` ODER Admin-Session-Cookie.
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const active = await prisma.shuffleBag.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const recent = await prisma.shuffleBag.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const activeSummary = active
    ? {
        id: active.id,
        slots: active.slots,
        slotsHash: active.slotsHash,
        currentIndex: active.currentIndex,
        remaining: active.slots.length - active.currentIndex,
        winnersRemaining: active.slots
          .slice(active.currentIndex)
          .filter((s) => s === 1).length,
        createdAt: active.createdAt,
      }
    : null;

  return NextResponse.json({
    active: activeSummary,
    recent: recent.map((b) => ({
      id: b.id,
      length: b.slots.length,
      currentIndex: b.currentIndex,
      slotsHash: b.slotsHash,
      isActive: b.isActive,
      createdAt: b.createdAt,
    })),
  });
}
