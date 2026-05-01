import { prisma } from "@repo/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = { email?: string; status?: string };

const STATUS_BADGE: Record<string, string> = {
  PAID: "bg-blue-500/15 text-blue-300",
  DELIVERED: "bg-green-500/15 text-green-300",
  REFUNDED: "bg-blue-500/15 text-blue-300",
  DELIVERY_FAILED: "bg-red-500/15 text-red-300",
  REFUND_FAILED: "bg-red-500/15 text-red-300",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { email, status } = await searchParams;

  const where: Record<string, unknown> = {};
  if (email) where.customerEmail = { contains: email, mode: "insensitive" };
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: { select: { sku: true, name: true } } },
  });

  const fmtAmount = (v: unknown) =>
    `${Number(v ?? 0).toFixed(2).replace(".", ",")} €`;
  const fmtDate = (d: Date) =>
    d.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Bestellungen</h1>

      <form className="mb-4 flex gap-2 text-sm" action="/admin/orders">
        <input
          type="text"
          name="email"
          defaultValue={email ?? ""}
          placeholder="Email-Filter (Teil-String)"
          className="flex-1 rounded border bg-transparent px-3 py-2"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded border bg-transparent px-3 py-2"
        >
          <option value="">Alle Status</option>
          <option value="PAID">PAID</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="REFUNDED">REFUNDED</option>
          <option value="DELIVERY_FAILED">DELIVERY_FAILED</option>
          <option value="REFUND_FAILED">REFUND_FAILED</option>
        </select>
        <button
          type="submit"
          className="rounded border px-4 py-2 hover:bg-[var(--muted)]"
        >
          Filtern
        </button>
        <Link
          href="/api/admin/export"
          className="rounded border px-4 py-2 hover:bg-[var(--muted)]"
        >
          CSV-Export
        </Link>
      </form>

      <p className="mb-2 text-sm text-[var(--muted-foreground)]">
        Zeige {orders.length} Bestellungen{email ? ` für „${email}"` : ""}
        {status ? ` mit Status ${status}` : ""} (max. 100, neueste zuerst)
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-semibold">Datum</th>
              <th className="py-2 pr-3 font-semibold">Email</th>
              <th className="py-2 pr-3 font-semibold">Produkt</th>
              <th className="py-2 pr-3 font-semibold text-right">Betrag</th>
              <th className="py-2 pr-3 font-semibold">Status</th>
              <th className="py-2 pr-3 font-semibold">Winner</th>
              <th className="py-2 pr-3 font-semibold">Key</th>
              <th className="py-2 pr-3 font-semibold">Email</th>
              <th className="py-2 font-semibold">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => {
              const badge =
                STATUS_BADGE[o.status] ?? "bg-[var(--muted)] text-[var(--muted-foreground)]";
              return (
                <tr key={o.id}>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {fmtDate(o.createdAt)}
                  </td>
                  <td
                    className="py-2 pr-3 max-w-[180px] truncate"
                    title={o.customerEmail}
                  >
                    {o.customerEmail}
                  </td>
                  <td
                    className="py-2 pr-3 max-w-[200px] truncate"
                    title={o.product.name}
                  >
                    {o.product.sku}
                  </td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {fmtAmount(o.amountTotal)}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badge}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    {o.isWinner ? "🎉 Ja" : "—"}
                  </td>
                  <td className="py-2 pr-3" title={o.licenseKey ?? ""}>
                    {o.licenseKey ? "✅" : "—"}
                  </td>
                  <td
                    className="py-2 pr-3"
                    title={o.emailError ?? (o.emailSentAt ? "OK" : "")}
                  >
                    {o.emailError ? "⚠️" : o.emailSentAt ? "✅" : "—"}
                  </td>
                  <td className="py-2">
                    <Link
                      href={`/bestellstatus?session_id=${encodeURIComponent(
                        o.stripeSessionId
                      )}&email=${encodeURIComponent(o.customerEmail)}`}
                      className="text-blue-400 hover:underline"
                    >
                      Ansehen
                    </Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-8 text-center text-[var(--muted-foreground)]"
                >
                  Keine Bestellungen gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
