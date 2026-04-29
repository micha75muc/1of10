import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();

vi.mock("@repo/db", () => ({
  prisma: {
    order: { findUnique: (...args: unknown[]) => mockFindUnique(...args) },
  },
}));

describe("GET /api/order-status", () => {
  let GET: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const mod = await import("../../app/api/order-status/route");
    GET = mod.GET as unknown as (req: Request) => Promise<Response>;
  });

  function makeReq(qs: string, ip = "8.8.8.8") {
    return new Request(`http://localhost/api/order-status${qs}`, {
      method: "GET",
      headers: { "x-forwarded-for": ip },
    });
  }

  it("antwortet 400 wenn sessionId fehlt", async () => {
    const res = await GET(makeReq(""));
    expect(res.status).toBe(400);
  });

  it("antwortet 404 wenn Order unbekannt", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await GET(makeReq("?sessionId=cs_unknown"));
    expect(res.status).toBe(404);
  });

  it("liefert Status-Payload bei valider sessionId", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "order-1",
      isWinner: true,
      refundStatus: "COMPLETED",
      status: "REFUNDED",
      amountTotal: 49.99,
      licenseKey: "XXXX-XXXX-XXXX-XXXX",
      deliveredAt: new Date("2024-01-01"),
      product: { name: "Test Software" },
    });
    const res = await GET(makeReq("?sessionId=cs_ok"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isWinner).toBe(true);
    expect(body.refundStatus).toBe("COMPLETED");
    expect(body.productName).toBe("Test Software");
    expect(body.licenseKey).toBe("XXXX-XXXX-XXXX-XXXX");
  });

  it("rate-limited nach 10 Anfragen pro Minute", async () => {
    mockFindUnique.mockResolvedValue({
      id: "order-1",
      isWinner: false,
      refundStatus: null,
      status: "PAID",
      amountTotal: 19.99,
      licenseKey: null,
      deliveredAt: null,
      product: { name: "Test" },
    });
    const ip = "7.7.7.7";
    for (let i = 0; i < 10; i++) {
      const ok = await GET(makeReq("?sessionId=cs_ok", ip));
      expect(ok.status).toBe(200);
    }
    const res = await GET(makeReq("?sessionId=cs_ok", ip));
    expect(res.status).toBe(429);
  });
});
