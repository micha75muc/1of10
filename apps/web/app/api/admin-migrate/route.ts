import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Schema sync endpoint — gated by DIAG_TOKEN. Adds columns the live DB is
 * missing relative to schema.prisma. PostgreSQL `ADD COLUMN IF NOT EXISTS`
 * makes every statement idempotent so this is safe to re-run.
 *
 * Used because the project relies on `prisma db push` and Vercel runtime has
 * no shell to invoke it. We mirror the schema deltas here.
 */
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("key");
  if (!process.env.DIAG_TOKEN || token !== process.env.DIAG_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const stmts: string[] = [
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "emailSentAt" TIMESTAMP(3)`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "emailError" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerName" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerPhone" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerAddressLine1" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerAddressLine2" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerCity" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerPostalCode" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerCountry" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "licenseKey" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "dsdCertificateId" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3)`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryError" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "refundStatus" TEXT`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "isWinner" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "bgbWiderrufOptIn" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "dsgvoOptIn" BOOLEAN NOT NULL DEFAULT false`,
  ];

  const results: Array<{ stmt: string; ok: boolean; error?: string }> = [];
  for (const s of stmts) {
    try {
      await prisma.$executeRawUnsafe(s);
      results.push({ stmt: s, ok: true });
    } catch (e) {
      results.push({
        stmt: s,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const cols = (await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name='Order' ORDER BY column_name`,
  )) as Array<{ column_name: string }>;

  return NextResponse.json({
    ok: results.every((r) => r.ok),
    statements: results,
    orderColumns: cols.map((c) => c.column_name),
  });
}
