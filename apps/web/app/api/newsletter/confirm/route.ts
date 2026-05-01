import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { logEvent, logWarn } from "../../../../lib/error-logger";

/**
 * GET /api/newsletter/confirm?token=...
 *
 * Doppel-Opt-In bestätigen — der Klick im Confirm-Mail-Link landet hier.
 * Wir setzen `confirmedAt` und löschen das Token (Replay-Schutz).
 *
 * Denny (Compliance): Erst nach diesem Klick darf der Datensatz für
 * Werbe-Mails verwendet werden.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10.de";

  if (!token || token.length < 32) {
    logWarn("newsletter.confirm.invalid_token");
    return NextResponse.redirect(`${appUrl}/?newsletter=invalid`, 302);
  }

  const signup = await prisma.newsletterSignup.findUnique({
    where: { confirmToken: token },
  });

  if (!signup) {
    logWarn("newsletter.confirm.token_not_found");
    return NextResponse.redirect(`${appUrl}/?newsletter=invalid`, 302);
  }

  if (signup.confirmedAt) {
    return NextResponse.redirect(`${appUrl}/?newsletter=already`, 302);
  }

  await prisma.newsletterSignup.update({
    where: { id: signup.id },
    data: {
      confirmedAt: new Date(),
      confirmToken: null,
    },
  });

  logEvent("newsletter.confirm.success", { id: signup.id });
  return NextResponse.redirect(`${appUrl}/?newsletter=confirmed`, 302);
}
