import { prisma } from "@repo/db";
import { RiskClass } from "./risk-classes";
import { evaluateAgentAction } from "./mappings";

export interface PolicyResult {
  allowed: boolean;
  riskClass: RiskClass;
  approvalItemId?: string;
}

/**
 * Enforces the policy layer for an agent action.
 *
 * - Class 1 (READ_ONLY): Always allowed, no logging
 * - Class 2 (DRAFT_PROPOSAL): Allowed, logged
 * - Class 3 (OPERATIONAL_WRITE): Allowed, logged to DB
 * - Class 4 (HIGH_RISK_EXECUTION): Blocked, routed to ApprovalQueue
 */
export async function enforcePolicy(
  agent: string,
  action: string,
  payload: unknown
): Promise<PolicyResult> {
  const riskClass = evaluateAgentAction(agent, action);

  if (riskClass === RiskClass.HIGH_RISK_EXECUTION) {
    const approvalItem = await prisma.approvalItem.create({
      data: {
        agentId: agent,
        riskClass,
        actionType: action,
        payload: payload as any,
        status: "PENDING",
      },
    });

    return {
      allowed: false,
      riskClass,
      approvalItemId: approvalItem.id,
    };
  }

  // Class 3: Log to DB but allow
  if (riskClass === RiskClass.OPERATIONAL_WRITE) {
    await prisma.approvalItem.create({
      data: {
        agentId: agent,
        riskClass,
        actionType: action,
        payload: payload as any,
        status: "APPROVED",
        approvedBy: "SYSTEM_AUTO",
      },
    });
  }

  return { allowed: true, riskClass };
}
