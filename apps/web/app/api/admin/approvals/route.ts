import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { enforcePolicy } from "@repo/policy";

function checkAdminAuth(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-admin-api-key");
  return apiKey === process.env.ADMIN_API_KEY;
}

// GET /api/admin/approvals — List all approval items (optionally filtered by status)
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PENDING";

  const items = await prisma.approvalItem.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

// POST /api/admin/approvals — Create a new approval item (called by agents)
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { agentId, actionType, payload } = body;

    if (!agentId || !actionType) {
      return NextResponse.json(
        { error: "agentId and actionType are required" },
        { status: 400 }
      );
    }

    const result = await enforcePolicy(agentId, actionType, payload ?? {});

    return NextResponse.json({
      ...result,
      message: result.allowed
        ? "Action allowed"
        : "Action blocked — requires human approval",
    });
  } catch (err) {
    console.error("[Admin Approvals API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
