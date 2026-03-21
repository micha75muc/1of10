import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks (paths relative to THIS test file: __tests__/api/) ---
const mockProductFindUnique = vi.fn();

vi.mock("@repo/db", () => ({
  prisma: {
    product: {
      findUnique: (...args: any[]) => mockProductFindUnique(...args),
    },
  },
}));

const mockSessionCreate = vi.fn();

vi.mock("../../lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: (...args: any[]) => mockSessionCreate(...args),
      },
    },
  },
}));

import { POST } from "../../app/api/checkout/route";

// Each test gets a unique IP to avoid rate-limiting cross-contamination
let ipCounter = 0;
function uniqueIp(): string {
  return `test-${Date.now()}-${ipCounter++}`;
}

function makeRequest(body: Record<string, unknown>, ip?: string): NextRequest {
  return new NextRequest("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip ?? uniqueIp(),
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  productId: "prod-1",
  customerEmail: "test@example.com",
  dsgvoOptIn: true,
  bgbWiderrufOptIn: true,
};

const mockProduct = {
  id: "prod-1",
  sku: "MS-365",
  name: "Microsoft 365",
  description: null,
  category: null,
  brand: null,
  imageUrl: null,
  costPrice: 50,
  sellPrice: 99.99,
  minimumMargin: 10,
  stockLevel: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockProductFindUnique.mockResolvedValue(mockProduct);
    mockSessionCreate.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/session/cs_test_123",
    });
  });

  // --- Happy Path ---
  it("sollte Stripe Session erstellen bei gültigem Request", async () => {
    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("url");
    expect(json).toHaveProperty("sessionId", "cs_test_123");
    expect(mockSessionCreate).toHaveBeenCalledOnce();
  });

  it("sollte Produkt-Daten korrekt an Stripe übergeben", async () => {
    await POST(makeRequest(validBody));

    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        customer_email: "test@example.com",
        metadata: expect.objectContaining({
          productId: "prod-1",
          dsgvoOptIn: "true",
          bgbWiderrufOptIn: "true",
        }),
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 9999,
              currency: "eur",
            }),
            quantity: 1,
          }),
        ]),
      })
    );
  });

  // --- Validation: Pflicht-Checkboxen ---
  it("sollte 400 zurückgeben wenn bgbWiderrufOptIn fehlt", async () => {
    const res = await POST(makeRequest({ ...validBody, bgbWiderrufOptIn: false }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Zustimmungen");
  });

  it("sollte 400 zurückgeben wenn dsgvoOptIn fehlt", async () => {
    const res = await POST(makeRequest({ ...validBody, dsgvoOptIn: false }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Zustimmungen");
  });

  it("sollte 400 zurückgeben wenn beide Checkboxen false sind", async () => {
    const res = await POST(
      makeRequest({ ...validBody, bgbWiderrufOptIn: false, dsgvoOptIn: false })
    );

    expect(res.status).toBe(400);
  });

  // --- Validation: Pflichtfelder ---
  it("sollte 400 zurückgeben wenn productId fehlt", async () => {
    const { productId, ...body } = validBody;
    const res = await POST(makeRequest(body));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("productId");
  });

  it("sollte 400 zurückgeben wenn customerEmail fehlt", async () => {
    const { customerEmail, ...body } = validBody;
    const res = await POST(makeRequest(body));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("productId");
  });

  it("sollte 400 zurückgeben bei ungültiger E-Mail-Adresse", async () => {
    const res = await POST(makeRequest({ ...validBody, customerEmail: "not-an-email" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("E-Mail");
  });

  // --- Produkt nicht gefunden ---
  it("sollte 404 zurückgeben wenn Produkt nicht existiert", async () => {
    mockProductFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toContain("nicht gefunden");
  });

  // --- Stock-Check ---
  it("sollte 400 zurückgeben wenn Produkt ausverkauft (stockLevel=0)", async () => {
    mockProductFindUnique.mockResolvedValue({
      ...mockProduct,
      stockLevel: 0,
    });

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("ausverkauft");
  });

  // --- Rate Limiting ---
  it("sollte 429 zurückgeben nach zu vielen Anfragen vom selben IP", async () => {
    const testIp = `rate-limit-test-${Date.now()}`;

    for (let i = 0; i < 5; i++) {
      await POST(makeRequest(validBody, testIp));
    }

    // 6. Request sollte blockiert werden
    const res = await POST(makeRequest(validBody, testIp));
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toContain("Zu viele Anfragen");
  });

  // --- Edge Cases ---
  it("sollte 500 zurückgeben bei Stripe-Fehler", async () => {
    mockSessionCreate.mockRejectedValue(new Error("Stripe API error"));

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(500);
  });

  it("sollte mit negativem stockLevel korrekt umgehen", async () => {
    mockProductFindUnique.mockResolvedValue({
      ...mockProduct,
      stockLevel: -1,
    });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(400);
  });
});
