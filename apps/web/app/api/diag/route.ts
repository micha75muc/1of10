import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only diagnostic. Returns DB connectivity + env presence.
// Auth: ?key=<ADMIN_API_KEY>
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const expected = process.env.DIAG_TOKEN || process.env.ADMIN_API_KEY;
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const out: Record<string, unknown> = {
    sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_prefix: process.env.DATABASE_URL?.slice(0, 24) ?? null,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      ADMIN_API_KEY: !!process.env.ADMIN_API_KEY,
      AGENTS_API_URL: process.env.AGENTS_API_URL ?? null,
      DSD_USERNAME: !!process.env.DSD_USERNAME,
      DSD_PASSWORD: !!process.env.DSD_PASSWORD,
      DSD_BASE_URL: process.env.DSD_BASE_URL ?? null,
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  try {
    const { prisma } = await import("@repo/db");
    const t0 = Date.now();
    const count = await prisma.product.count();
    out.prismaProductCount = count;
    out.prismaTookMs = Date.now() - t0;
  } catch (e) {
    const err = e as Error & { code?: string };
    out.prismaError = {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack?.split("\n").slice(0, 8),
    };
  }

  // Optional: simulate the mock checkout end-to-end if ?probe=checkout is set.
  if (url.searchParams.get("probe") === "checkout") {
    try {
      const { prisma } = await import("@repo/db");
      const product = await prisma.product.findFirst({
        where: { stockLevel: { gt: 0 } },
        orderBy: { sellPrice: "asc" },
      });
      if (!product) {
        out.checkoutProbe = { error: "no product with stock found" };
      } else {
        const probeRes = await fetch(`${url.origin}/api/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            customerEmail: "diag+probe@1of10-dummy.local",
            dsgvoOptIn: true,
            bgbWiderrufOptIn: true,
            customerName: "Diag Probe",
            customerPhone: "+491700000000",
            customerAddress: {
              line1: "Teststr 1",
              city: "Berlin",
              postal_code: "10115",
              country: "DE",
            },
          }),
        });
        const text = await probeRes.text();
        out.checkoutProbe = {
          status: probeRes.status,
          body: text.slice(0, 1500),
        };
      }
    } catch (e) {
      const err = e as Error;
      out.checkoutProbeError = {
        name: err.name,
        message: err.message,
        stack: err.stack?.split("\n").slice(0, 10),
      };
    }
  }

  return NextResponse.json(out, {
    headers: { "Cache-Control": "no-store" },
  });
}
