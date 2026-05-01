import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAdmin } from "../../../../lib/auth";

/**
 * GET /api/admin/export — CSV-Export aller Bestellungen für den Steuerberater.
 * Finance: EÜR-tauglicher Export mit allen relevanten Feldern.
 */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  // CSV Header
  const header = [
    "Datum",
    "Bestellnr",
    "Produkt",
    "SKU",
    "Kunde_Email",
    "Brutto_VK",
    "EK_inkl_MwSt",
    "Rohertrag",
    "Status",
    "Erstattung",
    "Erstattungsstatus",
  ].join(";");

  const rows = orders.map((o) => {
    const vk = Number(o.amountTotal);
    const ek = Number(o.product.costPrice);
    const rohertrag = vk - ek;
    return [
      new Date(o.createdAt).toISOString().split("T")[0],
      o.id.slice(0, 8),
      `"${o.product.name}"`,
      o.product.sku,
      o.customerEmail,
      vk.toFixed(2).replace(".", ","),
      ek.toFixed(2).replace(".", ","),
      rohertrag.toFixed(2).replace(".", ","),
      o.status,
      o.isWinner ? "Ja" : "Nein",
      o.refundStatus ?? "-",
    ].join(";");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="1of10-bestellungen-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
