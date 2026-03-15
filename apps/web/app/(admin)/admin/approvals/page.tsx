import { prisma } from "@repo/db";
import ApprovalTable from "./approval-table";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const items = await prisma.approvalItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = items.filter((i) => i.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Approval Queue</h1>
        {pending > 0 && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            {pending} ausstehend
          </span>
        )}
      </div>
      <ApprovalTable
        items={items.map((i) => ({
          ...i,
          payload: i.payload as unknown,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
