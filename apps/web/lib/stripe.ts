import { mockStripe } from "./stripe-mock";

/**
 * Stripe client — uses mock in development when STRIPE_MOCK=true,
 * otherwise uses real Stripe SDK.
 *
 * Usage:
 *   import { stripe } from "@/lib/stripe";
 *   const session = await stripe.checkout.sessions.create({...});
 */

function getStripeClient() {
  const useMock = process.env.STRIPE_MOCK === "true";

  if (useMock) {
    // Mock is allowed in development OR in production when TEST_MODE=true is
    // explicitly set. The TEST_MODE flag is reserved for staging-style
    // dummy-purchase E2E runs against the live deployment before the real
    // launch. Without TEST_MODE, mock mode in production is a fatal misconfig.
    if (
      process.env.NODE_ENV === "production" &&
      process.env.TEST_MODE !== "true"
    ) {
      throw new Error(
        "FATAL: STRIPE_MOCK=true in production requires TEST_MODE=true",
      );
    }
    return mockStripe;
  }

  // Real Stripe — lazy import to avoid bundling when not needed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
  });
}

// Use a lazy proxy so the client is only created on first access
let _stripe: ReturnType<typeof getStripeClient> | null = null;

export const stripe = new Proxy({} as ReturnType<typeof getStripeClient>, {
  get(_target, prop) {
    if (!_stripe) {
      _stripe = getStripeClient();
    }
    return (_stripe as Record<string | symbol, unknown>)[prop];
  },
});
