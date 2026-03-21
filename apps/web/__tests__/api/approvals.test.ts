import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockApprovalUpdate = vi.fn();
const mockApprovalCreate = vi.fn();

vi.mock("@repo/db", () => ({
  prisma: {
    approvalItem: {
      findMany: (...args: any[]) => mockFindMany(...args),
      findUnique: (...args: any[]) => mockFindUnique(...args),
      create: (...args: any[]) => mockApprovalCreate(...args),
      update: (...args: any[]) => mockApprovalUpdate(...args),
    },
  },
}));

vi.mock("@repo/policy", () => ({
  enforcePolicy: vi.fn(),
}));

import { GET, POST } from "../../app/api/admin/approvals/route";
import { PATCH } from "../../app/api/admin/approvals/[id]/route";
import { enforcePolicy } from "@repo/policy";

const mockEnforcePolicy = vi.mocked(enforcePolicy);

const ADMIN_API_KEY = "test-admin-key-123";

function makeGetRequest(
  params: Record<string, string> = {},
  apiKey?: string
): NextRequest {
  const url = new URL("http://localhost:3000/api/admin/approvals");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url, {
    method: "GET",
    headers: apiKey !== undefined
      ? { "x-admin-api-key": apiKey }
      : {},
  });
}

function makePostRequest(body: Record<string, unknown>, apiKey?: string): NextRequest {
  return new NextRequest("http://localhost:3000/api/admin/approvals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey !== undefined ? { "x-admin-api-key": apiKey } : {}),
    },
    body: JSON.stringify(body),
  });
}

function makePatchRequest(
  id: string,
  body: Record<string, unknown>,
  apiKey?: string
): NextRequest {
  return new NextRequest(`http://localhost:3000/api/admin/approvals/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey !== undefined ? { "x-admin-api-key": apiKey } : {}),
    },
    body: JSON.stringify(body),
  });
}

const fakeApprovalItem = {
  id: "approval-1",
  agentId: "Nestor",
  riskClass: 4,
  actionType: "PURCHASE_KEYS",
  payload: { quantity: 100 },
  status: "PENDING",
  approvedBy: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

describe("Admin Approvals API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_API_KEY = ADMIN_API_KEY;
  });

  // ============================
  // GET /api/admin/approvals
  // ============================
  describe("GET /api/admin/approvals", () => {
    it("sollte alle PENDING ApprovalItems zurückgeben (Default-Filter)", async () => {
      mockFindMany.mockResolvedValue([fakeApprovalItem]);

      const res = await GET(makeGetRequest({}, ADMIN_API_KEY));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.items).toHaveLength(1);
      expect(json.items[0].status).toBe("PENDING");
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
        })
      );
    });

    it("sollte nach Status filtern wenn Parameter übergeben", async () => {
      mockFindMany.mockResolvedValue([]);

      const res = await GET(makeGetRequest({ status: "APPROVED" }, ADMIN_API_KEY));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "APPROVED" },
        })
      );
    });

    it("sollte alle Items zurückgeben bei status=ALL", async () => {
      mockFindMany.mockResolvedValue([fakeApprovalItem]);

      await GET(makeGetRequest({ status: "ALL" }, ADMIN_API_KEY));

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });

    it("sollte 401 zurückgeben ohne API-Key", async () => {
      const res = await GET(makeGetRequest({}));
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toContain("Unauthorized");
    });

    it("sollte 401 zurückgeben mit falschem API-Key", async () => {
      const res = await GET(makeGetRequest({}, "wrong-key"));

      expect(res.status).toBe(401);
    });
  });

  // ============================
  // POST /api/admin/approvals
  // ============================
  describe("POST /api/admin/approvals", () => {
    it("sollte Policy-Enforcement ausführen und Ergebnis zurückgeben (erlaubt)", async () => {
      mockEnforcePolicy.mockResolvedValue({
        allowed: true,
        riskClass: 3,
      });

      const res = await POST(
        makePostRequest(
          { agentId: "Nestor", actionType: "UPDATE_SELL_PRICE", payload: { price: 89.99 } },
          ADMIN_API_KEY
        )
      );
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.allowed).toBe(true);
      expect(json.message).toContain("allowed");
    });

    it("sollte HIGH_RISK Aktion blockieren und Approval erstellen", async () => {
      mockEnforcePolicy.mockResolvedValue({
        allowed: false,
        riskClass: 4,
        approvalItemId: "approval-new",
      });

      const res = await POST(
        makePostRequest(
          { agentId: "Nestor", actionType: "PURCHASE_KEYS", payload: { quantity: 100 } },
          ADMIN_API_KEY
        )
      );
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.allowed).toBe(false);
      expect(json.approvalItemId).toBe("approval-new");
      expect(json.message).toContain("blocked");
    });

    it("sollte 400 zurückgeben wenn agentId fehlt", async () => {
      const res = await POST(
        makePostRequest({ actionType: "UPDATE_SELL_PRICE" }, ADMIN_API_KEY)
      );
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain("agentId");
    });

    it("sollte 400 zurückgeben wenn actionType fehlt", async () => {
      const res = await POST(
        makePostRequest({ agentId: "Nestor" }, ADMIN_API_KEY)
      );
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain("actionType");
    });

    it("sollte ohne Auth funktionieren (POST ist Agent-Endpunkt)", async () => {
      // POST /approvals wird von Agenten aufgerufen und hat keinen Auth-Check
      mockEnforcePolicy.mockResolvedValue({ allowed: true, riskClass: 1 });

      const res = await POST(
        makePostRequest({ agentId: "Martin", actionType: "QUERY_KNOWLEDGE_BASE" })
      );

      expect(res.status).toBe(200);
    });
  });

  // ============================
  // PATCH /api/admin/approvals/[id]
  // ============================
  describe("PATCH /api/admin/approvals/[id]", () => {
    const patchParams = Promise.resolve({ id: "approval-1" });

    it("sollte Approval-Status auf APPROVED setzen", async () => {
      mockFindUnique.mockResolvedValue(fakeApprovalItem);
      mockApprovalUpdate.mockResolvedValue({
        ...fakeApprovalItem,
        status: "APPROVED",
        approvedBy: "admin@1of10.de",
      });

      const res = await PATCH(
        makePatchRequest("approval-1", { action: "APPROVED", approvedBy: "admin@1of10.de" }, ADMIN_API_KEY),
        { params: patchParams }
      );
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.item.status).toBe("APPROVED");
      expect(json.item.approvedBy).toBe("admin@1of10.de");
    });

    it("sollte Approval-Status auf REJECTED setzen", async () => {
      mockFindUnique.mockResolvedValue(fakeApprovalItem);
      mockApprovalUpdate.mockResolvedValue({
        ...fakeApprovalItem,
        status: "REJECTED",
        approvedBy: "admin",
      });

      const res = await PATCH(
        makePatchRequest("approval-1", { action: "REJECTED" }, ADMIN_API_KEY),
        { params: patchParams }
      );
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.item.status).toBe("REJECTED");
    });

    it("sollte Default-approvedBy='admin' setzen wenn nicht angegeben", async () => {
      mockFindUnique.mockResolvedValue(fakeApprovalItem);
      mockApprovalUpdate.mockResolvedValue({
        ...fakeApprovalItem,
        status: "APPROVED",
        approvedBy: "admin",
      });

      await PATCH(
        makePatchRequest("approval-1", { action: "APPROVED" }, ADMIN_API_KEY),
        { params: patchParams }
      );

      expect(mockApprovalUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ approvedBy: "admin" }),
        })
      );
    });

    it("sollte 401 zurückgeben ohne API-Key", async () => {
      const res = await PATCH(
        makePatchRequest("approval-1", { action: "APPROVED" }),
        { params: patchParams }
      );

      expect(res.status).toBe(401);
    });

    it("sollte 400 zurückgeben bei ungültiger Action", async () => {
      const res = await PATCH(
        makePatchRequest("approval-1", { action: "INVALID" }, ADMIN_API_KEY),
        { params: patchParams }
      );
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain("APPROVED");
    });

    it("sollte 400 zurückgeben wenn action fehlt", async () => {
      const res = await PATCH(
        makePatchRequest("approval-1", {}, ADMIN_API_KEY),
        { params: patchParams }
      );

      expect(res.status).toBe(400);
    });

    it("sollte 404 zurückgeben wenn Approval-Item nicht existiert", async () => {
      mockFindUnique.mockResolvedValue(null);

      const res = await PATCH(
        makePatchRequest("nonexistent-id", { action: "APPROVED" }, ADMIN_API_KEY),
        { params: Promise.resolve({ id: "nonexistent-id" }) }
      );
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.error).toContain("not found");
    });

    it("sollte 400 zurückgeben wenn Item bereits verarbeitet wurde", async () => {
      mockFindUnique.mockResolvedValue({
        ...fakeApprovalItem,
        status: "APPROVED",
      });

      const res = await PATCH(
        makePatchRequest("approval-1", { action: "REJECTED" }, ADMIN_API_KEY),
        { params: patchParams }
      );
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain("already");
    });
  });
});
