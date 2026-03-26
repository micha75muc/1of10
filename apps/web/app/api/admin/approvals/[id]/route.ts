import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { executeApprovedAction } from "../../../../../lib/action-dispatcher";

import { verifySession } from "../../../../../lib/auth";

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const apiKey = req.headers.get("x-admin-api-key");
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) return true;
  return await verifySession();
}

// PATCH /api/admin/approvals/[id] — Approve or Reject an approval item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, approvedBy } = body;

  if (!action || !["APPROVED", "REJECTED"].includes(action)) {
    return NextResponse.json(
      { error: "action must be 'APPROVED' or 'REJECTED'" },
      { status: 400 }
    );
  }

  const item = await prisma.approvalItem.findUnique({ where: { id } });

  if (!item) {
    return NextResponse.json(
      { error: "Approval item not found" },
      { status: 404 }
    );
  }

  if (item.status !== "PENDING") {
    return NextResponse.json(
      { error: `Item already ${item.status}` },
      { status: 400 }
    );
  }

  const updated = await prisma.approvalItem.update({
    where: { id },
    data: {
      status: action,
      approvedBy: approvedBy ?? "admin",
    },
  });

  // Execute the action after approval
  if (action === "APPROVED") {
    const result = await executeApprovedAction(
      item.actionType,
      item.payload as any
    );

    const finalStatus = result.success ? "APPROVED" : "FAILED";
    const finalItem = await prisma.approvalItem.update({
      where: { id },
      data: {
        status: finalStatus,
        executionResult: result as any,
      },
    });

    return NextResponse.json({ item: finalItem, execution: result });
  }

  return NextResponse.json({ item: updated });
}
