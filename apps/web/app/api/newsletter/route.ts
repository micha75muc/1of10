import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { rateLimit } from "../../../lib/rate-limit";
import { RATE_LIMIT_WINDOW_MS } from "../../../lib/constants";
import { logEvent, logError } from "../../../lib/error-logger";

/**
 * POST /api/newsletter — Speichert Newsletter-Anmeldungen in der DB.
 * Gregor (Growth): Echte Persistenz statt localStorage.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { ok } = rateLimit(ip, { maxRequests: 5, windowMs: RATE_LIMIT_WINDOW_MS });
    if (!ok) {
      return NextResponse.json({ error: "Zu viele Anfragen" }, { status: 429 });
    }

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

    logEvent("newsletter.signup", {
      email: email.replace(/(.{2}).*(@.*)/, "$1***$2"),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, { event: "api.newsletter.failed" });
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
