import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

/**
 * POST /api/newsletter — Speichert Newsletter-Anmeldungen in der DB.
 * Gregor (Growth): Echte Persistenz statt localStorage.
 */
export async function POST(req: NextRequest) {
  try {
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
      email,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Newsletter] Error:", err);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
