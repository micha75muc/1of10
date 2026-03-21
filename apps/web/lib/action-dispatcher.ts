import { prisma } from "@repo/db";
import { sendEmail } from "./email";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

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
    return { success: false, error: `Nestor API error ${res.status}: ${errorBody}` };
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
  console.log("[FlagForReview] Audit-Log-Eintrag:", JSON.stringify(payload));
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
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
