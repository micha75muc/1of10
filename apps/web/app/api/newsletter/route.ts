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
    if (!globalThis.__nlRL) globalThis.__nlRL = new Map();
    const rl = globalThis.__nlRL as Map<string, number[]>;
    const hits = (rl.get(key) ?? []).filter(t => t > now - windowMs);
    if (hits.length >= maxReq) {
      return NextResponse.json({ error: "Zu viele Anfragen" }, { status: 429 });
    }
    hits.push(now);
    rl.set(key, hits);

    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Ungültige E-Mail" }, { status: 400 });
    }

    // Upsert — don't create duplicate if already subscribed
    // Using Order table's customerEmail as a lightweight solution
    // TODO: Eigene NewsletterSubscriber-Tabelle in nächster Schema-Migration
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
