import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type Stripe from "stripe";

// --- Mocks (paths relative to THIS test file: __tests__/api/) ---
const mockOrderCreate = vi.fn();
const mockOrderFindUnique = vi.fn();
const mockOrderUpdate = vi.fn();
const mockProductUpdate = vi.fn();

vi.mock("@repo/db", () => ({
  prisma: {
    order: {
      findUnique: (...args: any[]) => mockOrderFindUnique(...args),
      create: (...args: any[]) => mockOrderCreate(...args),
      update: (...args: any[]) => mockOrderUpdate(...args),
    },
    product: {
      update: (...args: any[]) => mockProductUpdate(...args),
    },
  },
}));

const mockConstructEvent = vi.fn();
const mockRefundCreate = vi.fn();

vi.mock("../../lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: any[]) => mockConstructEvent(...args),
    },
    refunds: {
      create: (...args: any[]) => mockRefundCreate(...args),
    },
  },
}));

const mockSendEmail = vi.fn().mockResolvedValue({ id: "mock-email" });
const mockOrderConfirmationEmail = vi.fn().mockReturnValue({
  to: "test@example.com",
  subject: "Bestellbestätigung",
  html: "<p>Test</p>",
});

vi.mock("../../lib/email", () => ({
  sendEmail: (...args: any[]) => mockSendEmail(...args),
  orderConfirmationEmail: (...args: any[]) => mockOrderConfirmationEmail(...args),
}));

const mockDrawFromShuffleBag = vi.fn();

vi.mock("../../lib/shuffle-bag", () => ({
  drawFromShuffleBag: (...args: any[]) => mockDrawFromShuffleBag(...args),
}));

import { POST } from "../../app/api/webhooks/stripe/route";

// --- Helpers ---
function createStripeEvent(
  type: string,
  sessionOverrides: Record<string, unknown> = {}
): Stripe.Event {
  return {
    id: "evt_test_123",
    type,
    data: {
      object: {
        id: "cs_test_session_1",
        customer_email: "winner@example.com",
        amount_total: 9999,
        payment_intent: "pi_test_123",
        metadata: {
          productId: "prod-1",
          dsgvoOptIn: "true",
          bgbWiderrufOptIn: "true",
        },
        ...sessionOverrides,
      },
    },
    object: "event",
    api_version: "2024-12-18.acacia",
    created: Date.now(),
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as unknown as Stripe.Event;
}

function makeWebhookRequest(
  body: string,
  signature = "valid_sig_123"
): NextRequest {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (signature) {
    headers["stripe-signature"] = signature;
  }
  return new NextRequest("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    headers,
    body,
  });
}

const fakeOrder = {
  id: "order-1",
  stripeSessionId: "cs_test_session_1",
  productId: "prod-1",
  customerEmail: "winner@example.com",
  amountTotal: 99.99,
  status: "PAID",
  bgbWiderrufOptIn: true,
  dsgvoOptIn: true,
  isWinner: false,
  refundStatus: null,
  product: { id: "prod-1", name: "Microsoft 365" },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";

    mockConstructEvent.mockReturnValue(
      createStripeEvent("checkout.session.completed")
    );
    mockOrderFindUnique.mockResolvedValue(null);
    mockOrderCreate.mockResolvedValue(fakeOrder);
    mockOrderUpdate.mockResolvedValue(fakeOrder);
    mockProductUpdate.mockResolvedValue({});
    mockDrawFromShuffleBag.mockResolvedValue(false);
    mockRefundCreate.mockResolvedValue({ id: "re_test", status: "succeeded" });
  });

  // --- Happy Path ---
  it("sollte Order erstellen bei gültigem checkout.session.completed Event", async () => {
    const res = await POST(makeWebhookRequest('{"type":"checkout.session.completed"}'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("received", true);
    expect(json).toHaveProperty("orderId", "order-1");
    expect(mockOrderCreate).toHaveBeenCalledOnce();
  });

  it("sollte Order-Daten korrekt aus Session extrahieren", async () => {
    await POST(makeWebhookRequest("{}"));

    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stripeSessionId: "cs_test_session_1",
          productId: "prod-1",
          customerEmail: "winner@example.com",
          amountTotal: 99.99,
          status: "PAID",
          bgbWiderrufOptIn: true,
          dsgvoOptIn: true,
        }),
      })
    );
  });

  it("sollte Stock dekrementieren nach erfolgreicher Order", async () => {
    await POST(makeWebhookRequest("{}"));

    expect(mockProductUpdate).toHaveBeenCalledWith({
      where: { id: "prod-1" },
      data: { stockLevel: { decrement: 1 } },
    });
  });

  it("sollte Bestätigungs-E-Mail senden", async () => {
    await POST(makeWebhookRequest("{}"));

    expect(mockOrderConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: "winner@example.com",
        amountTotal: 9999,
        isWinner: false,
      })
    );
    expect(mockSendEmail).toHaveBeenCalledOnce();
  });

  // --- Signatur-Validierung ---
  it("sollte 400 zurückgeben bei fehlender Stripe-Signatur", async () => {
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("sollte 400 zurückgeben bei ungültiger Signatur", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await POST(makeWebhookRequest("{}", "invalid_sig"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("Invalid signature");
  });

  it("sollte 400 zurückgeben wenn STRIPE_WEBHOOK_SECRET fehlt", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(400);
  });

  // --- Idempotenz ---
  it("sollte bestehende Order zurückgeben bei doppeltem Event (Idempotenz)", async () => {
    mockOrderFindUnique.mockResolvedValue(fakeOrder);

    const res = await POST(makeWebhookRequest("{}"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("message", "Order already processed");
    expect(json).toHaveProperty("orderId", "order-1");
    expect(mockOrderCreate).not.toHaveBeenCalled();
  });

  // --- Nicht relevante Event-Typen ---
  it("sollte andere Event-Typen ignorieren und {received: true} zurückgeben", async () => {
    mockConstructEvent.mockReturnValue(
      createStripeEvent("payment_intent.created")
    );

    const res = await POST(makeWebhookRequest("{}"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ received: true });
    expect(mockOrderCreate).not.toHaveBeenCalled();
  });

  // --- Winner-Ermittlung ---
  it("sollte isWinner=true setzen und Refund initiieren bei Gewinner", async () => {
    mockDrawFromShuffleBag.mockResolvedValue(true);
    mockOrderCreate.mockResolvedValue({ ...fakeOrder, isWinner: true, refundStatus: "INITIATED" });

    const res = await POST(makeWebhookRequest("{}"));
    const json = await res.json();

    expect(json).toHaveProperty("isWinner", true);
    expect(mockRefundCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent: "pi_test_123",
        amount: 9999,
        metadata: expect.objectContaining({ reason: "kulanz_erstattung" }),
      })
    );
  });

  it("sollte Refund-Status auf COMPLETED setzen nach erfolgreichem Refund", async () => {
    mockDrawFromShuffleBag.mockResolvedValue(true);
    mockOrderCreate.mockResolvedValue({ ...fakeOrder, isWinner: true });

    await POST(makeWebhookRequest("{}"));

    expect(mockOrderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: { refundStatus: "COMPLETED", status: "REFUNDED" },
      })
    );
  });

  it("sollte Refund-Status auf FAILED setzen bei Refund-Fehler", async () => {
    mockDrawFromShuffleBag.mockResolvedValue(true);
    mockOrderCreate.mockResolvedValue({ ...fakeOrder, isWinner: true });
    mockRefundCreate.mockRejectedValue(new Error("Stripe refund failed"));

    await POST(makeWebhookRequest("{}"));

    expect(mockOrderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-1" },
        data: { refundStatus: "FAILED" },
      })
    );
  });

  it("sollte keinen Refund initiieren bei Nicht-Gewinner", async () => {
    mockDrawFromShuffleBag.mockResolvedValue(false);

    await POST(makeWebhookRequest("{}"));

    expect(mockRefundCreate).not.toHaveBeenCalled();
  });

  // --- Fehlende Session-Daten ---
  it("sollte 400 zurückgeben wenn productId in Metadata fehlt", async () => {
    mockConstructEvent.mockReturnValue(
      createStripeEvent("checkout.session.completed", {
        metadata: { dsgvoOptIn: "true", bgbWiderrufOptIn: "true" },
      })
    );

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(400);
  });

  it("sollte 400 zurückgeben wenn customer_email fehlt", async () => {
    mockConstructEvent.mockReturnValue(
      createStripeEvent("checkout.session.completed", {
        customer_email: null,
      })
    );

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(400);
  });

  it("sollte 400 zurückgeben wenn amount_total fehlt", async () => {
    mockConstructEvent.mockReturnValue(
      createStripeEvent("checkout.session.completed", {
        amount_total: null,
      })
    );

    const res = await POST(makeWebhookRequest("{}"));
    expect(res.status).toBe(400);
  });
});
