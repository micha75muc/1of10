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

  it("antwortet 400 wenn sessionId oder email fehlt", async () => {
    const noQs = await GET(makeReq(""));
    expect(noQs.status).toBe(400);
    const onlyId = await GET(makeReq("?sessionId=cs_x"));
    expect(onlyId.status).toBe(400);
  });

  it("antwortet 404 wenn Order unbekannt", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const res = await GET(makeReq("?sessionId=cs_unknown&email=x%40y.de"));
    expect(res.status).toBe(404);
  });

  it("antwortet 404 wenn Email nicht zur Order passt (Enumeration-Schutz)", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "order-1",
      isWinner: false,
      refundStatus: null,
      status: "PAID",
      amountTotal: 19.99,
      licenseKey: null,
      deliveredAt: null,
      customerEmail: "owner@example.com",
      product: { name: "Test" },
    });
    const res = await GET(makeReq("?sessionId=cs_ok&email=attacker%40evil.com"));
    expect(res.status).toBe(404);
  });

  it("liefert Status-Payload bei valider sessionId+email", async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: "order-1",
      isWinner: true,
      refundStatus: "COMPLETED",
      status: "REFUNDED",
      amountTotal: 49.99,
      licenseKey: "XXXX-XXXX-XXXX-XXXX",
      deliveredAt: new Date("2024-01-01"),
      customerEmail: "Owner@Example.com",
      product: { name: "Test Software" },
    });
    const res = await GET(
      makeReq("?sessionId=cs_ok&email=owner%40example.com"),
    );
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
      customerEmail: "rl@example.com",
      product: { name: "Test" },
    });
    const ip = "7.7.7.7";
    const qs = "?sessionId=cs_ok&email=rl%40example.com";
    for (let i = 0; i < 10; i++) {
      const ok = await GET(makeReq(qs, ip));
      expect(ok.status).toBe(200);
    }
    const res = await GET(makeReq(qs, ip));
    expect(res.status).toBe(429);
  });
});
