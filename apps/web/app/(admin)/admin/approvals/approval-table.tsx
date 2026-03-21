"use client";

import { useState } from "react";

interface ExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

interface ApprovalItemData {
  id: string;
  agentId: string;
  riskClass: number;
  actionType: string;
  payload: unknown;
  status: string;
  approvedBy: string | null;
  executionResult: ExecutionResult | null;
  createdAt: string;
}

export default function ApprovalTable({
  items: initialItems,
}: {
  items: ApprovalItemData[];
}) {
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAction(id: string, action: "APPROVED" | "REJECTED") {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/approvals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-api-key": "dev-admin-key-change-in-production",
        },
        body: JSON.stringify({ action, approvedBy: "admin-ui" }),
      });

      if (res.ok) {
        const data = await res.json();
        const returnedItem = data.item;
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: returnedItem.status,
                  approvedBy: returnedItem.approvedBy,
                  executionResult: returnedItem.executionResult ?? data.execution ?? null,
                }
              : item
          )
        );
      }
    } finally {
      setLoadingId(null);
    }
  }

  const riskBadge = (rc: number) => {
    const colors: Record<number, string> = {
      1: "bg-green-100 text-green-800",
      2: "bg-blue-100 text-blue-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[rc] ?? "bg-gray-100"}`}
      >
        Klasse {rc}
      </span>
    );
  };

  if (items.length === 0) {
    return (
      <p className="text-[var(--muted-foreground)]">
        Keine ausstehenden Genehmigungen.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-3 pr-4 font-medium">Agent</th>
            <th className="py-3 pr-4 font-medium">Aktion</th>
            <th className="py-3 pr-4 font-medium">Risiko</th>
            <th className="py-3 pr-4 font-medium">Payload</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-4 font-medium">Erstellt</th>
            <th className="py-3 font-medium">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-3 pr-4 font-medium">{item.agentId}</td>
              <td className="py-3 pr-4">{item.actionType}</td>
              <td className="py-3 pr-4">{riskBadge(item.riskClass)}</td>
              <td className="py-3 pr-4">
                <code className="rounded bg-[var(--muted)] px-2 py-1 text-xs">
                  {JSON.stringify(item.payload).substring(0, 60)}
                  {JSON.stringify(item.payload).length > 60 ? "…" : ""}
                </code>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : item.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : item.status === "FAILED"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="py-3 pr-4 text-[var(--muted-foreground)]">
                {new Date(item.createdAt).toLocaleString("de-DE")}
              </td>
              <td className="py-3">
                {item.status === "PENDING" ? (
                  loadingId === item.id ? (
                    <span className="text-xs text-blue-600 animate-pulse">
                      Aktion wird ausgeführt…
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(item.id, "APPROVED")}
                        className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(item.id, "REJECTED")}
                        className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {item.approvedBy}
                    </span>
                    {item.executionResult && (
                      <span
                        className={`text-xs ${item.executionResult.success ? "text-green-600" : "text-red-600"}`}
                      >
                        {item.executionResult.success
                          ? "✓ Erfolgreich ausgeführt"
                          : `✗ Fehler: ${item.executionResult.error}`}
                      </span>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
