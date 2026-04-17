import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../../lib/auth";

/**
 * POST /api/admin/shuffle-bag/seed
 *
 * Deaktiviert alle bestehenden Shuffle-Bags und erstellt einen neuen mit
 * deterministischen Slots — für Testkäufe (Winner-/Non-Winner-Pfad).
 *
 * Body: { slots: number[] }  — nur 0 oder 1, Länge 1..20
 *
 * Auth: Header `x-admin-api-key: ${ADMIN_API_KEY}` ODER Admin-Session-Cookie.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slots = (body as { slots?: unknown })?.slots;
  if (!Array.isArray(slots) || slots.length < 1 || slots.length > 20) {
    return NextResponse.json(
      { error: "slots must be an array of length 1..20" },
      { status: 400 }
    );
  }
  if (!slots.every((s) => s === 0 || s === 1)) {
    return NextResponse.json(
      { error: "slots must contain only 0 or 1" },
      { status: 400 }
    );
  }

  const slotsHash = createHash("sha256")
    .update(JSON.stringify(slots))
    .digest("hex");

  const bag = await prisma.$transaction(async (tx) => {
    await tx.shuffleBag.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    return tx.shuffleBag.create({
      data: {
        slots: slots as number[],
        currentIndex: 0,
        isActive: true,
        slotsHash,
      },
    });
  });

  return NextResponse.json({
    id: bag.id,
    slots: bag.slots,
    slotsHash: bag.slotsHash,
    currentIndex: bag.currentIndex,
    isActive: bag.isActive,
    createdAt: bag.createdAt,
  });
}
