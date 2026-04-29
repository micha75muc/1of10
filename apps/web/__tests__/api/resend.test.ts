import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindFirst = vi.fn();
const mockSendEmail = vi.fn().mockResolvedValue({ ok: true, id: "mock_email_1" });

vi.mock("@repo/db", () => ({
  prisma: {
    order: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
  },
}));

vi.mock("../../lib/email", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
  orderConfirmationEmail: (params: Record<string, unknown>) => ({
    to: params.customerEmail,
    subject: "Deine Bestellung bei 1of10",
    html: `<p>Mock HTML for ${String(params.productName)}</p>`,
  }),
}));

describe("POST /api/orders/[orderId]/resend", () => {
  let POST: (
    req: Request,
    ctx: { params: Promise<{ orderId: string }> },
  ) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const mod = await import("../../app/api/orders/[orderId]/resend/route");
    POST = mod.POST as unknown as (
      req: Request,
      ctx: { params: Promise<{ orderId: string }> },
    ) => Promise<Response>;
  });

  function makeReq(body: Record<string, unknown>, ip = "9.9.9.9") {
    return new Request("http://localhost/api/orders/order-1/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(body),
    }) as unknown as import("next/server").NextRequest;
  }

  it("sendet Mail erneut bei valider sessionId+orderId", async () => {
    mockFindFirst.mockResolvedValueOnce({
      id: "order-1",
      stripeSessionId: "cs_ok",
      customerEmail: "buyer@example.com",
      amountTotal: 49.99,
      isWinner: false,
      licenseKey: "AAAA-BBBB-CCCC-DDDD",
      product: {
        name: "Test Software",
        requiresVendorAccount: false,
        vendorName: null,
        vendorActivationUrl: null,
      },
    });
    const res = await POST(makeReq({ sessionId: "cs_ok" }), {
      params: Promise.resolve({ orderId: "order-1" }),
    });
    expect(res.status).toBe(200);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  it("antwortet 404 bei falscher sessionId — keine Existenz-Information", async () => {
    mockFindFirst.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ sessionId: "cs_wrong" }), {
      params: Promise.resolve({ orderId: "order-1" }),
    });
    expect(res.status).toBe(404);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("antwortet 400 wenn sessionId fehlt", async () => {
    const res = await POST(makeReq({}), {
      params: Promise.resolve({ orderId: "order-1" }),
    });
    expect(res.status).toBe(400);
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("rate-limited 4. Anfrage innerhalb von 5 Minuten", async () => {
    mockFindFirst.mockResolvedValue({
      id: "order-1",
      stripeSessionId: "cs_ok",
      customerEmail: "buyer@example.com",
      amountTotal: 49.99,
      isWinner: false,
      licenseKey: null,
      product: {
        name: "Test",
        requiresVendorAccount: false,
        vendorName: null,
        vendorActivationUrl: null,
      },
    });
    const ip = "5.5.5.5";
    for (let i = 0; i < 3; i++) {
      const ok = await POST(makeReq({ sessionId: "cs_ok" }, ip), {
        params: Promise.resolve({ orderId: "order-1" }),
      });
      expect(ok.status).toBe(200);
    }
    const res = await POST(makeReq({ sessionId: "cs_ok" }, ip), {
      params: Promise.resolve({ orderId: "order-1" }),
    });
    expect(res.status).toBe(429);
  });
});
