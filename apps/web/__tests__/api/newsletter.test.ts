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

// Mock email module — DOI mail must not actually fire in tests
vi.mock("../../lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: "mock_email" }),
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

  it("sollte gültige E-Mail mit Consent in DB speichern", async () => {
    const res = await POST(
      makeReq({ email: "user@example.com", consent: true }),
    );
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "user@example.com" },
        create: expect.objectContaining({
          email: "user@example.com",
          consentGiven: true,
          confirmToken: expect.any(String),
        }),
      }),
    );
  });

  it("sollte Anmeldung ohne Consent-Flag ablehnen (DSGVO)", async () => {
    const res = await POST(makeReq({ email: "user@example.com" }));
    expect(res.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("sollte Anmeldung mit consent=false ablehnen", async () => {
    const res = await POST(
      makeReq({ email: "user@example.com", consent: false }),
    );
    expect(res.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("sollte ungültige E-Mail ablehnen", async () => {
    const res = await POST(
      makeReq({ email: "not-an-email", consent: true }),
    );
    expect(res.status).toBe(400);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("sollte leere E-Mail ablehnen", async () => {
    const res = await POST(makeReq({ email: "", consent: true }));
    expect(res.status).toBe(400);
  });

  it("sollte fehlende E-Mail ablehnen", async () => {
    const res = await POST(makeReq({ consent: true }));
    expect(res.status).toBe(400);
  });

  it("sollte Duplikate via Upsert akzeptieren (DOI-Token wird neu gesetzt)", async () => {
    const res1 = await POST(
      makeReq({ email: "dup@example.com", consent: true }, "10.0.0.1"),
    );
    expect(res1.status).toBe(200);
    const res2 = await POST(
      makeReq({ email: "dup@example.com", consent: true }, "10.0.0.2"),
    );
    expect(res2.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledTimes(2);
  });
});
