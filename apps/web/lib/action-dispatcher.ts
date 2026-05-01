import { prisma } from "@repo/db";
import { sendEmail } from "./email";
import { logEvent, logError } from "./error-logger";

/**
 * Internal JSON shape we pass between the approval queue and the action
 * handlers. Mirrors `Prisma.JsonValue` so callers can hand us the raw
 * `ApprovalItem.payload` field without an `any` cast — but kept as a
 * separate alias so we don't depend on Prisma's exact runtime types in
 * test mocks.
 */
export type JsonPayload =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonPayload | undefined }
  | JsonPayload[];

type JsonValue = JsonPayload;

interface ActionResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

// --- Handler Functions ---

async function handlePurchaseKeys(payload: JsonValue): Promise<ActionResult> {
  const agentsUrl = process.env.AGENTS_API_URL ?? "http://localhost:8000";
  const res = await fetch(`${agentsUrl}/api/agents/nestor/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    return { success: false, error: `Agent API error ${res.status}: ${errorBody}` };
  }

  const data = await res.json();
  return { success: true, result: data };
}

async function handlePublishWinner(payload: JsonValue): Promise<ActionResult> {
  const p = payload as { orderId?: string };
  if (!p.orderId) {
    return { success: false, error: "payload.orderId fehlt" };
  }

  const order = await prisma.order.findUnique({ where: { id: p.orderId } });
  if (!order) {
    return { success: false, error: `Order ${p.orderId} nicht gefunden` };
  }

  await prisma.order.update({
    where: { id: p.orderId },
    data: { isWinner: true },
  });

  return { success: true, result: { orderId: p.orderId, isWinner: true } };
}

async function handleSendOutreach(payload: JsonValue): Promise<ActionResult> {
  const p = payload as { to?: string; subject?: string; html?: string };
  if (!p.to || !p.subject || !p.html) {
    return { success: false, error: "payload muss 'to', 'subject' und 'html' enthalten" };
  }

  const emailResult = await sendEmail({
    to: p.to,
    subject: p.subject,
    html: p.html,
  });

  return { success: true, result: emailResult };
}

async function handleFlagForReview(payload: JsonValue): Promise<ActionResult> {
  // Strukturierter Audit-Log statt console.log — landet in Vercel Logs
  // und ist nach `event:agents.flagged` durchsuchbar.
  logEvent("agents.flagged_for_review", { payload });
  return { success: true, result: { logged: true } };
}

// --- Dispatcher ---

const ACTION_HANDLERS: Record<string, (payload: JsonValue) => Promise<ActionResult>> = {
  PURCHASE_KEYS: handlePurchaseKeys,
  PUBLISH_WINNER: handlePublishWinner,
  SEND_OUTREACH: handleSendOutreach,
  FLAG_FOR_REVIEW: handleFlagForReview,
};

export async function executeApprovedAction(
  actionType: string,
  payload: JsonValue
): Promise<ActionResult> {
  const handler = ACTION_HANDLERS[actionType];
  if (!handler) {
    return { success: false, error: `Unbekannter actionType: ${actionType}` };
  }

  try {
    return await handler(payload);
  } catch (err) {
    logError(err, { event: "action-dispatcher.handler.failed", actionType });
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
