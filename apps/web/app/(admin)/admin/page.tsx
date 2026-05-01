import { prisma } from "@repo/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orderCount, winnerCount, pendingApprovals, totalRevenue, products] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { isWinner: true } }),
      prisma.approvalItem.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ _sum: { amountTotal: true } }),
      prisma.product.findMany({ select: { sku: true, name: true, costPrice: true, sellPrice: true, stockLevel: true }, orderBy: { sellPrice: "asc" } }),
    ]);

  const stats = [
    { label: "Bestellungen", value: orderCount, href: null },
    { label: "Erstattungskunde (10%)", value: winnerCount, href: null },
    {
      label: "Umsatz",
      value: `${Number(totalRevenue._sum.amountTotal ?? 0).toFixed(2).replace(".", ",")} €`,
      href: null,
    },
    {
      label: "Ausstehende Approvals",
      value: pendingApprovals,
      href: "/admin/approvals",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const content = (
            <div
              key={stat.label}
              className="rounded-lg border p-6 hover:shadow-sm transition"
            >
              <p className="text-sm text-[var(--muted-foreground)]">
                {stat.label}
              </p>
              <p className="mt-1 text-3xl font-bold">{stat.value}</p>
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      {/* Margin Overview */}
      <h2 className="mt-8 mb-4 text-xl font-bold">Margen-Übersicht</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-semibold">Produkt</th>
              <th className="py-2 pr-3 font-semibold text-right">EK</th>
              <th className="py-2 pr-3 font-semibold text-right">VK</th>
              <th className="py-2 pr-3 font-semibold text-right">Marge</th>
              <th className="py-2 pr-3 font-semibold text-right">Nach 1/10</th>
              <th className="py-2 font-semibold text-right">Lager</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => {
              const cost = Number(p.costPrice);
              const sell = Number(p.sellPrice);
              const margin = sell > 0 ? ((sell - cost) / sell) * 100 : 0;
              const afterRefund = margin - 10;
              return (
                <tr key={p.sku} className={afterRefund < 15 ? "text-red-400" : ""}>
                  <td className="py-2 pr-3 font-medium">{p.name}</td>
                  <td className="py-2 pr-3 text-right">{cost.toFixed(2).replace(".", ",")} €</td>
                  <td className="py-2 pr-3 text-right">{sell.toFixed(2).replace(".", ",")} €</td>
                  <td className="py-2 pr-3 text-right">{margin.toFixed(1)}%</td>
                  <td className="py-2 pr-3 text-right font-semibold">{afterRefund.toFixed(1)}%</td>
                  <td className="py-2 text-right">{p.stockLevel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
