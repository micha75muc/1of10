import { prisma } from "@repo/db";
import { DSD_MAPPINGS } from "../../../../lib/dsd-mappings.generated";
import { ApplyButton } from "./apply-button";

export const dynamic = "force-dynamic";

export default async function CatalogBackfillPage() {
  const skus = Object.keys(DSD_MAPPINGS);
  const products = await prisma.product.findMany({
    where: { sku: { in: skus } },
    select: { sku: true, name: true, brand: true, category: true, dsdProductCode: true, costPrice: true, sellPrice: true },
    orderBy: [{ brand: "asc" }, { name: "asc" }],
  });

  const wouldUpdate = products.filter((p) => !p.dsdProductCode);
  const alreadySet = products.filter(
    (p) => p.dsdProductCode && p.dsdProductCode === DSD_MAPPINGS[p.sku],
  );
  const conflicts = products.filter(
    (p) => p.dsdProductCode && p.dsdProductCode !== DSD_MAPPINGS[p.sku],
  );

  const totalFulfillable = await prisma.product.count({
    where: { dsdProductCode: { not: null }, stockLevel: { gt: 0 } },
  });

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">DSD-Code Backfill</h1>
      <p className="mb-6 text-sm text-neutral-600">
        Verknüpft Produkte aus dem Shop mit den passenden DSD-Codes für die automatische
        Lizenzauslieferung. Idempotent — überschreibt nichts, was bereits gesetzt ist.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Mappings konfiguriert" value={skus.length} />
        <Stat label="Werden aktualisiert" value={wouldUpdate.length} highlight={wouldUpdate.length > 0} />
        <Stat label="Bereits korrekt" value={alreadySet.length} />
        <Stat label="Konflikte" value={conflicts.length} highlight={conflicts.length > 0} />
      </div>

      <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <strong>Aktuell aktiv:</strong> {totalFulfillable} Produkte sichtbar &amp; bestellbar.
        Nach Anwendung dieses Backfills steigt das auf bis zu{" "}
        <strong>{totalFulfillable + wouldUpdate.length}</strong>.
      </div>

      {wouldUpdate.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Wird gesetzt ({wouldUpdate.length})</h2>
          <Table rows={wouldUpdate.map((p) => ({
            sku: p.sku, name: p.name, brand: p.brand, category: p.category,
            current: "—", target: DSD_MAPPINGS[p.sku],
          }))} />
          <div className="mt-4">
            <ApplyButton count={wouldUpdate.length} />
          </div>
        </section>
      )}

      {conflicts.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-amber-700">
            Konflikte (werden NICHT geändert): {conflicts.length}
          </h2>
          <p className="mb-2 text-xs text-neutral-600">
            Diese Produkte haben bereits einen DSD-Code, der vom Mapping abweicht.
            Bewusst übersprungen — manuell prüfen.
          </p>
          <Table rows={conflicts.map((p) => ({
            sku: p.sku, name: p.name, brand: p.brand, category: p.category,
            current: p.dsdProductCode ?? "—", target: DSD_MAPPINGS[p.sku],
          }))} />
        </section>
      )}

      {alreadySet.length > 0 && (
        <details className="mb-8">
          <summary className="cursor-pointer text-sm font-medium text-neutral-600">
            Bereits korrekt gesetzt ({alreadySet.length})
          </summary>
          <div className="mt-3">
            <Table rows={alreadySet.map((p) => ({
              sku: p.sku, name: p.name, brand: p.brand, category: p.category,
              current: p.dsdProductCode ?? "—", target: DSD_MAPPINGS[p.sku],
            }))} />
          </div>
        </details>
      )}

      {wouldUpdate.length === 0 && conflicts.length === 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          ✓ Alle konfigurierten Mappings sind bereits in der DB gesetzt. Nichts zu tun.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-blue-300 bg-blue-50" : "border-neutral-200 bg-white"}`}>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Table({ rows }: { rows: { sku: string; name: string; brand: string; category: string; current: string; target: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600">
          <tr>
            <th className="px-3 py-2 text-left font-medium">SKU</th>
            <th className="px-3 py-2 text-left font-medium">Produkt</th>
            <th className="px-3 py-2 text-left font-medium">Marke</th>
            <th className="px-3 py-2 text-left font-medium">Aktuell</th>
            <th className="px-3 py-2 text-left font-medium">→ Neu</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sku} className="border-t border-neutral-100">
              <td className="px-3 py-2 font-mono text-xs">{r.sku}</td>
              <td className="px-3 py-2">{r.name}</td>
              <td className="px-3 py-2 text-neutral-600">{r.brand}</td>
              <td className="px-3 py-2 font-mono text-xs text-neutral-500">{r.current}</td>
              <td className="px-3 py-2 font-mono text-xs font-medium text-blue-700">{r.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
