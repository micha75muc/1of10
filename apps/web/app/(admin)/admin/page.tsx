import { prisma } from "@repo/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orderCount, winnerCount, pendingApprovals, totalRevenue] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { isWinner: true } }),
      prisma.approvalItem.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({ _sum: { amountTotal: true } }),
    ]);

  const stats = [
    { label: "Bestellungen", value: orderCount, href: null },
    { label: "Gewinner (10%)", value: winnerCount, href: null },
    {
      label: "Umsatz",
      value: `${Number(totalRevenue._sum.amountTotal ?? 0).toFixed(2)} €`,
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
    </div>
  );
}
