import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../../../lib/auth";
import { deliverLicenseKey } from "../../../../../../lib/key-delivery";
import { logError, logEvent } from "../../../../../../lib/error-logger";

/**
 * POST /api/admin/orders/[id]/retry-delivery
 *
 * S4 — Erneute DSD-Lieferung wenn der initiale Versuch im Webhook fehlgeschlagen
 * ist (Order.status === "DELIVERY_FAILED" oder licenseKey null trotz dsdProductCode).
 * Bei Erfolg wird licenseKey, dsdCertificateId, deliveredAt gesetzt und Status
 * auf DELIVERED (bzw. REFUNDED bei Winnern) zurückgeschoben.
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
  if (!order.product.dsdProductCode) {
    return NextResponse.json(
      { error: "Product has no dsdProductCode — manual fulfilment only" },
      { status: 400 },
    );
  }
  if (order.licenseKey) {
    return NextResponse.json(
      { error: "Order already has license key — refusing to redeliver" },
      { status: 409 },
    );
  }

  const nameParts = (order.customerName ?? "").trim().split(/\s+/);
  const firstName = nameParts.length >= 1 ? nameParts[0] : undefined;
  const lastName = nameParts.length >= 2 ? nameParts.slice(1).join(" ") : undefined;

  const delivery = await deliverLicenseKey({
    productCode: order.product.dsdProductCode,
    customerEmail: order.customerEmail,
    reference: order.id,
    customerName: order.customerName ?? undefined,
    firstName,
    lastName,
    phone: order.customerPhone ?? undefined,
    mandatoryFields: order.product.dsdMandatoryClientFields,
  });

  if (delivery.ok && delivery.licenseKey) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        licenseKey: delivery.licenseKey,
        dsdCertificateId: delivery.certificateId ?? null,
        deliveredAt: new Date(),
        deliveryError: null,
        status: order.isWinner ? "REFUNDED" : "DELIVERED",
      },
    });
    logEvent("admin.order.retry-delivery.success", { orderId: order.id });
    return NextResponse.json({ ok: true, licenseKey: delivery.licenseKey });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { deliveryError: delivery.error ?? "Unknown delivery error" },
  });
  logError(delivery.error ?? "Unknown delivery error", {
    event: "admin.order.retry-delivery.failed",
    orderId: order.id,
  });
  return NextResponse.json(
    { ok: false, error: delivery.error ?? "Unknown delivery error" },
    { status: 502 },
  );
}
