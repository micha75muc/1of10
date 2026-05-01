import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@repo/db";
import { rateLimit } from "../../../lib/rate-limit";
import { RATE_LIMIT_WINDOW_MS } from "../../../lib/constants";
import { logEvent, logError } from "../../../lib/error-logger";
import { sendEmail } from "../../../lib/email";

/**
 * POST /api/newsletter — Newsletter-Anmeldung mit Doppel-Opt-In.
 *
 * Denny (Compliance):
 *   1. Server-side Validierung der DSGVO-Checkbox (`consent: true`).
 *      Ohne diese Bestätigung weisen wir den Request ab — Beweispflicht
 *      gem. Art. 7(1) DSGVO.
 *   2. Wir speichern Zustimmungs-Zeitpunkt, IP und User-Agent als
 *      Audit-Trail.
 *   3. Confirm-Token wird per E-Mail verschickt; ohne Bestätigung dürfen
 *      wir die Adresse NICHT für Werbe-Mails benutzen.
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { ok } = rateLimit(ip, { maxRequests: 5, windowMs: RATE_LIMIT_WINDOW_MS });
    if (!ok) {
      return NextResponse.json({ error: "Zu viele Anfragen" }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      consent?: boolean;
    };
    const { email, consent } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "Ungültige E-Mail" }, { status: 400 });
    }

    if (consent !== true) {
      return NextResponse.json(
        {
          error:
            "Bitte bestätige die Einwilligung zum Newsletter-Empfang (DSGVO).",
        },
        { status: 400 },
      );
    }

    const userAgent = req.headers.get("user-agent")?.slice(0, 255) ?? null;
    const confirmToken = randomBytes(32).toString("hex");
    const now = new Date();

    // Upsert: re-signup eines bereits existierenden Kontakts ist ok, wir
    // setzen das Token zurück und re-issuen die Bestätigungsmail.
    const signup = await prisma.newsletterSignup.upsert({
      where: { email },
      create: {
        email,
        consentGiven: true,
        consentTimestamp: now,
        consentIp: ip,
        consentUserAgent: userAgent,
        confirmToken,
      },
      update: {
        consentGiven: true,
        consentTimestamp: now,
        consentIp: ip,
        consentUserAgent: userAgent,
        confirmToken,
        // ein erneutes Signup hebt den Unsubscribe nicht auf, bis zur
        // expliziten DOI-Bestätigung
        confirmedAt: null,
        unsubscribedAt: null,
      },
    });

    // DOI-Mail (best-effort — wenn das Versenden scheitert, behalten wir
    // den Datensatz und ein admin-driven re-trigger ist möglich).
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10.de";
    const confirmUrl = `${appUrl}/api/newsletter/confirm?token=${confirmToken}`;
    try {
      await sendEmail({
        to: email,
        subject: "Bitte bestätige deine Newsletter-Anmeldung — 1of10",
        html: `
          <h1>Bitte bestätige deine Anmeldung</h1>
          <p>Du hast dich für den 1of10-Newsletter angemeldet. Damit wir dir Mails schicken dürfen, klicke bitte auf den folgenden Link:</p>
          <p><a href="${confirmUrl}" style="display:inline-block;background:#16a34a;color:white;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;">Anmeldung bestätigen</a></p>
          <p style="font-size:12px;color:#666;">Falls du das nicht angefordert hast, ignoriere diese E-Mail einfach — ohne Bestätigung schicken wir dir nichts.</p>
          <p style="font-size:12px;color:#666;">Anmeldung erfolgte am ${now.toISOString()} von IP ${ip}.</p>
        `,
      });
    } catch (mailErr) {
      logError(mailErr, { event: "newsletter.confirm_mail.failed" });
    }

    logEvent("newsletter.signup.pending", {
      id: signup.id,
      email: email.replace(/(.{2}).*(@.*)/, "$1***$2"),
    });

    return NextResponse.json({
      success: true,
      message:
        "Bitte bestätige den Link in der E-Mail, die wir dir gerade gesendet haben.",
    });
  } catch (err) {
    logError(err, { event: "api.newsletter.failed" });
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
