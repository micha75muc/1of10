import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";

function checkAdminAuth(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-admin-api-key");
  return apiKey === process.env.ADMIN_API_KEY;
}

// PATCH /api/admin/approvals/[id] — Approve or Reject an approval item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(req)) {
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

  // TODO: If APPROVED and actionType is executable, trigger the actual action here
  // e.g. if actionType === "PURCHASE_KEYS", call the distributor API

  return NextResponse.json({ item: updated });
}
