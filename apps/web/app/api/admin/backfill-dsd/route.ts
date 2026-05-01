import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../lib/auth";
import { DSD_MAPPINGS } from "../../../../lib/dsd-mappings.generated";

/**
 * GET  /api/admin/backfill-dsd  → dry-run preview (no DB writes)
 * POST /api/admin/backfill-dsd  → apply (idempotent: only fills NULL dsdProductCode)
 */
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const plan = await analyse();
  return NextResponse.json({
    mode: "dry-run",
    totals: {
      mappingsConfigured: Object.keys(DSD_MAPPINGS).length,
      wouldUpdate: plan.wouldUpdate.length,
      alreadySet: plan.alreadySet.length,
      unknownSkus: plan.unknownSkus.length,
      conflicts: plan.conflicts.length,
    },
    ...plan,
  });
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const plan = await analyse();
  const updated: string[] = [];
  for (const item of plan.wouldUpdate) {
    await prisma.product.update({
      where: { sku: item.sku },
      data: { dsdProductCode: item.toCode },
    });
    updated.push(item.sku);
  }
  return NextResponse.json({
    mode: "applied",
    updatedCount: updated.length,
    updated,
    conflictsSkipped: plan.conflicts.length,
    conflicts: plan.conflicts,
  });
}

type Plan = {
  wouldUpdate: { sku: string; name: string; toCode: string }[];
  alreadySet: { sku: string; currentCode: string }[];
  unknownSkus: string[];
  conflicts: { sku: string; currentCode: string; mappedCode: string }[];
};

async function analyse(): Promise<Plan> {
  const skus = Object.keys(DSD_MAPPINGS);
  const products = await prisma.product.findMany({
    where: { sku: { in: skus } },
    select: { sku: true, name: true, dsdProductCode: true },
  });
  const seen = new Set<string>();
  const wouldUpdate: Plan["wouldUpdate"] = [];
  const alreadySet: Plan["alreadySet"] = [];
  const conflicts: Plan["conflicts"] = [];
  for (const p of products) {
    seen.add(p.sku);
    const target = DSD_MAPPINGS[p.sku];
    if (!target) continue;
    if (!p.dsdProductCode) {
      wouldUpdate.push({ sku: p.sku, name: p.name, toCode: target });
    } else if (p.dsdProductCode === target) {
      alreadySet.push({ sku: p.sku, currentCode: p.dsdProductCode });
    } else {
      conflicts.push({
        sku: p.sku,
        currentCode: p.dsdProductCode,
        mappedCode: target,
      });
    }
  }
  const unknownSkus = skus.filter((s) => !seen.has(s));
  return { wouldUpdate, alreadySet, unknownSkus, conflicts };
}
