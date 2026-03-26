import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * POST /api/newsletter — Speichert Newsletter-Anmeldungen in der DB.
 * Gregor (Growth): Echte Persistenz statt localStorage.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const windowMs = 60_000;
    const maxReq = 5;
    const key = `newsletter:${ip}`;
    const g = globalThis as unknown as { __nlRL?: Map<string, number[]> };
    if (!g.__nlRL) g.__nlRL = new Map();
    const hits = (g.__nlRL.get(key) ?? []).filter(t => t > now - windowMs);
    if (hits.length >= maxReq) {
      return NextResponse.json({ error: "Zu viele Anfragen" }, { status: 429 });
    }
    hits.push(now);
    g.__nlRL.set(key, hits);

    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Ungültige E-Mail" }, { status: 400 });
    }

    // Persist to DB (upsert to avoid duplicates)
    await prisma.newsletterSignup.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    console.log(JSON.stringify({
      level: "info",
      event: "newsletter.signup",
      email: email.replace(/(.{2}).*(@.*)/, "$1***$2"),
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Newsletter] Error:", err);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
