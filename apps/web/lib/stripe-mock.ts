import { randomUUID } from "crypto";

/**
 * Mock Stripe service for development.
 * Simulates Stripe Checkout Sessions and Refunds without real API calls.
 */

export interface MockCheckoutSession {
  id: string;
  url: string;
  metadata: Record<string, string>;
  amount_total: number;
  customer_email: string;
  payment_status: "paid" | "unpaid";
  status: "complete" | "open";
}

export interface MockRefund {
  id: string;
  charge: string;
  amount: number;
  status: "succeeded" | "pending" | "failed";
}

// In-memory store for mock sessions
const sessions = new Map<string, MockCheckoutSession>();

export const mockStripe = {
  checkout: {
    sessions: {
      create: async (params: {
        line_items: Array<{ price_data: { unit_amount: number; currency: string; product_data: { name: string } }; quantity: number }>;
        mode: string;
        success_url: string;
        cancel_url: string;
        customer_email: string;
        metadata: Record<string, string>;
      }): Promise<MockCheckoutSession> => {
        const sessionId = `cs_mock_${randomUUID()}`;
        const session: MockCheckoutSession = {
          id: sessionId,
          url: params.success_url.replace("{CHECKOUT_SESSION_ID}", sessionId),
          metadata: params.metadata,
          amount_total: params.line_items.reduce(
            (sum, item) => sum + item.price_data.unit_amount * item.quantity,
            0
          ),
          customer_email: params.customer_email,
          payment_status: "paid",
          status: "complete",
        };
        sessions.set(session.id, session);
        return session;
      },

      retrieve: async (sessionId: string): Promise<MockCheckoutSession | null> => {
        return sessions.get(sessionId) ?? null;
      },
    },
  },

  refunds: {
    create: async (params: {
      payment_intent?: string;
      amount?: number;
      metadata?: Record<string, string>;
    }): Promise<MockRefund> => {
      return {
        id: `re_mock_${randomUUID()}`,
        charge: params.payment_intent ?? "ch_mock",
        amount: params.amount ?? 0,
        status: "succeeded",
      };
    },
  },
};
