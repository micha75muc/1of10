/**
 * Order service — single source of truth for Order DB access used by
 * Server Components and API routes.
 *
 * Why a service layer here, when most pages can call Prisma directly?
 * Three reasons:
 *
 *   1. The order-by-session lookup is repeated in 4 places (success page,
 *      bestellstatus page, resend endpoint, order-status endpoint). Each
 *      copy decides which fields to select. Drift = customer-facing bugs
 *      (e.g. one place forgets `licenseKey`).
 *   2. Email-match is the only auth boundary on the public bestellstatus
 *      lookup — keeping it inside the service avoids each caller having
 *      to remember to lower-case + compare.
 *   3. We can add caching / instrumentation in one place later.
 */

import { prisma } from "@repo/db";

/** Standard select shape used everywhere we surface an order to a customer. */
const customerOrderSelect = {
  id: true,
  stripeSessionId: true,
  customerEmail: true,
  amountTotal: true,
  status: true,
  refundStatus: true,
  isWinner: true,
  licenseKey: true,
  createdAt: true,
  product: {
    select: {
      id: true,
      sku: true,
      name: true,
      requiresVendorAccount: true,
      vendorName: true,
      vendorActivationUrl: true,
    },
  },
} as const;

export type CustomerOrder = NonNullable<
  Awaited<ReturnType<typeof getOrderBySessionId>>
>;

/**
 * Look up an order by its Stripe Checkout session id. Returns `null` when
 * not found. No auth check — callers must apply their own (e.g. webhook
 * trusts session-id, success page trusts URL).
 */
export async function getOrderBySessionId(sessionId: string) {
  if (!sessionId) return null;
  return prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    select: customerOrderSelect,
  });
}

/**
 * Look up an order by Stripe session id AND verify the email matches.
 * Used by `/bestellstatus` to prevent enumeration: a wrong session-id and
 * a session-id with a wrong email both return `null`.
 */
export async function getCustomerOrderByLookup(
  sessionId: string,
  email: string,
) {
  const order = await getOrderBySessionId(sessionId);
  if (!order) return null;
  if (order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
    return null;
  }
  return order;
}

/**
 * Look up an order by primary id and Stripe session id together. Used by
 * the resend endpoint as authentication: caller must already know both.
 */
export async function getOrderForResend(orderId: string, sessionId: string) {
  if (!orderId || !sessionId) return null;
  return prisma.order.findFirst({
    where: { id: orderId, stripeSessionId: sessionId },
    select: customerOrderSelect,
  });
}
