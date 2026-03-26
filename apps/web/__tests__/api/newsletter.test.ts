import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
const mockUpsert = vi.fn().mockResolvedValue({ id: "nl-1", email: "test@example.com" });
const mockFindMany = vi.fn().mockResolvedValue([]);

vi.mock("@repo/db", () => ({
  prisma: {
    newsletterSignup: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
    order: { findMany: (...args: unknown[]) => mockFindMany(...args) },
  },
}));

describe("POST /api/newsletter", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../../app/api/newsletter/route");
    POST = mod.POST as unknown as (req: Request) => Promise<Response>;
  });

  function makeReq(body: Record<string, unknown>, ip = "1.2.3.4") {
    return new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(body),
    }) as unknown as import("next/server").NextRequest;
  }

  it("sollte gültige E-Mail in DB speichern", async () => {
    const res = await POST(makeReq({ email: "user@example.com" }));
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "user@example.com" },
        create: { email: "user@example.com" },
      })
    );
  });

  it("sollte ungültige E-Mail ablehnen", async () => {
    const res = await POST(makeReq({ email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("sollte leere E-Mail ablehnen", async () => {
    const res = await POST(makeReq({ email: "" }));
    expect(res.status).toBe(400);
  });

  it("sollte fehlende E-Mail ablehnen", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("sollte Duplikate via Upsert akzeptieren", async () => {
    const res1 = await POST(makeReq({ email: "dup@example.com" }, "10.0.0.1"));
    expect(res1.status).toBe(200);
    const res2 = await POST(makeReq({ email: "dup@example.com" }, "10.0.0.2"));
    expect(res2.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledTimes(2);
  });
});
