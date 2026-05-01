import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../../../lib/auth";
import { sendEmail, orderConfirmationEmail } from "../../../../../../lib/email";
import { logError, logEvent } from "../../../../../../lib/error-logger";

/**
 * POST /api/admin/orders/[id]/retry-email
 *
 * S5 — Erneuter Versand der Bestellbestätigung wenn der initiale Versand
 * im Webhook fehlgeschlagen ist (Resend-Outage, Rate-Limit, …). Setzt
 * emailSentAt / leert emailError bei Erfolg.
 *
 * Idempotent: Wenn die Mail bereits versandt wurde, wird trotzdem erneut
 * gesendet (z.B. weil Kunde schreibt: "Mail nicht angekommen") — die Tabelle
 * speichert nur den letzten erfolgreichen Versand.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { product: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const emailParams = orderConfirmationEmail({
    customerEmail: order.customerEmail,
    productName: order.product.name,
    amountTotal: Math.round(Number(order.amountTotal) * 100),
    isWinner: order.isWinner,
    licenseKey: order.licenseKey ?? undefined,
    requiresVendorAccount: order.product.requiresVendorAccount,
    vendorName: order.product.vendorName ?? undefined,
    vendorActivationUrl: order.product.vendorActivationUrl ?? undefined,
    orderId: order.id,
    orderDate: order.createdAt,
    customerName: order.customerName ?? undefined,
  });

  try {
    await sendEmail(emailParams);
    await prisma.order.update({
      where: { id: order.id },
      data: { emailSentAt: new Date(), emailError: null },
    });
    logEvent("admin.order.retry-email.success", { orderId: order.id });
    return NextResponse.json({ ok: true, sentAt: new Date().toISOString() });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logError(err, { event: "admin.order.retry-email.failed", orderId: order.id });
    await prisma.order.update({
      where: { id: order.id },
      data: { emailError: errMsg },
    });
    return NextResponse.json({ ok: false, error: errMsg }, { status: 502 });
  }
}
