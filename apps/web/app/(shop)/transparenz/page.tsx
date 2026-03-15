import { prisma } from "@repo/db";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparenz — Unsere Erstattungen in Echtzeit",
  description:
    "Live-Statistik unserer Kaufpreiserstattungen. Echte Zahlen, direkt aus unserem System.",
};

export const dynamic = "force-dynamic";

export default async function TransparenzPage() {
  const [totalOrders, totalWinners, totalRefundAmount, recentWinners] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { isWinner: true } }),
      prisma.order.aggregate({
        where: { isWinner: true, refundStatus: "COMPLETED" },
        _sum: { amountTotal: true },
      }),
      prisma.order.findMany({
        where: { isWinner: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { product: true },
      }),
    ]);

  const refundRate =
    totalOrders > 0 ? ((totalWinners / totalOrders) * 100).toFixed(1) : "—";
  const totalRefunded = Number(totalRefundAmount._sum.amountTotal ?? 0);

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-3 text-3xl font-bold">Transparenz</h1>
      <p className="mb-8 text-[var(--muted-foreground)]">
        Echte Zahlen, direkt aus unserem System — nicht ausgedacht, nicht
        geschönt. Diese Seite aktualisiert sich mit jedem Kauf automatisch.
      </p>

      {/* Stats Grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gesamte Käufe" value={totalOrders.toString()} />
        <StatCard label="Davon erstattet" value={totalWinners.toString()} />
        <StatCard label="Erstattungsquote" value={`${refundRate} %`} highlight />
        <StatCard
          label="Erstattet (Gesamt)"
          value={`${totalRefunded.toFixed(2)} €`}
        />
      </div>

      {/* How it works */}
      <div className="mb-10 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="mb-4 text-xl font-semibold">Wie funktioniert das?</h2>
        <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
          <p>
            Wir erstatten exakt jeden 10. Kauf in unserem Shop — über alle
            Kunden hinweg. Die Auswahl ist zufällig und fair.
          </p>
          <p>
            <span className="font-medium text-[var(--foreground)]">
              Wichtig:
            </span>{" "}
            Die Erstattung bezieht sich auf jeden 10. Kauf insgesamt, nicht auf
            jeden 10. Kauf eines einzelnen Kunden. Ob dein Kauf erstattet wird,
            erfährst du sofort nach dem Kauf. Je öfter du kaufst, desto höher
            die Wahrscheinlichkeit, dass einer deiner Käufe dabei ist.
          </p>
          <p>
            Die Erstattung ist eine freiwillige Kulanzleistung — der angezeigte
            Preis ist immer der verbindliche Kaufpreis. Dein Produkt behältst du
            in jedem Fall.
          </p>
        </div>
      </div>

      {/* Recent refunds */}
      {recentWinners.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Letzte Erstattungen
          </h2>
          <div className="space-y-2">
            {recentWinners.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border bg-[var(--card)] px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎉</span>
                  <div>
                    <p className="font-medium">{order.product.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {order.createdAt.toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[var(--gold)]">
                  {Number(order.amountTotal).toFixed(2)} € erstattet
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalOrders === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-[var(--muted-foreground)]">
            Noch keine Käufe — die Statistik füllt sich mit dem ersten
            Kauf automatisch.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition"
          >
            Zum Shop
          </Link>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        Diese Daten werden in Echtzeit aus unserer Datenbank geladen und sind
        nicht manuell editierbar.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "border-[var(--gold)]/30 bg-[var(--gold)]/5"
          : "bg-[var(--card)]"
      }`}
    >
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold ${
          highlight ? "text-[var(--gold)]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
