import { prisma } from "@repo/db";

/**
 * Winner Ticker — shows recent refunded orders as social proof.
 * Fully automated: reads from DB, no manual input needed.
 */

const TICKER_ITEMS = 5;

// Time-ago helper
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "gerade eben";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tag${days > 1 ? "en" : ""}`;
}

export async function WinnerTicker() {
  const winners = await prisma.order.findMany({
    where: { isWinner: true, refundStatus: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: TICKER_ITEMS,
    include: { product: true },
  });

  if (winners.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-b border-[var(--gold)]/20 bg-[var(--gold)]/5 px-6 py-6">
      <div className="mx-auto max-w-4xl">
        <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[var(--gold)]">
          Letzte Erstattungen
        </h3>
        <div className="space-y-2">
          {winners.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg bg-[var(--card)] border border-[var(--gold)]/10 px-4 py-2.5 text-sm animate-slide-in"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🎉</span>
                <span className="font-medium">{order.product.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-[var(--gold)]">
                  {Number(order.amountTotal).toFixed(2)} € erstattet
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {timeAgo(order.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
          Freiwillige Kulanzleistung — wir erstatten jeden 10. Kauf.
        </p>
      </div>
    </section>
  );
}
