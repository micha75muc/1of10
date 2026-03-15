import { RiskClass } from "./risk-classes";

/**
 * Maps agent + action pairs to their risk classification.
 * This is the deterministic policy layer that controls what agents can do.
 */

type AgentActionKey = `${string}:${string}`;

const RISK_MAPPINGS: Record<AgentActionKey, RiskClass> = {
  // Nestor (Procurement)
  "Nestor:GET_DISTRIBUTOR_PRICE": RiskClass.READ_ONLY,
  "Nestor:DRAFT_PRICE_UPDATE": RiskClass.DRAFT_PROPOSAL,
  "Nestor:UPDATE_SELL_PRICE": RiskClass.OPERATIONAL_WRITE,
  "Nestor:PURCHASE_KEYS": RiskClass.HIGH_RISK_EXECUTION,

  // Elena (Finance)
  "Elena:QUERY_ORDERS": RiskClass.READ_ONLY,
  "Elena:GET_STRIPE_FEES": RiskClass.READ_ONLY,
  "Elena:GENERATE_REPORT": RiskClass.DRAFT_PROPOSAL,

  // Inge (Marketing & Sales)
  "Inge:GET_DSGVO_WINNERS": RiskClass.READ_ONLY,
  "Inge:DRAFT_CONTENT": RiskClass.DRAFT_PROPOSAL,
  "Inge:PUBLISH_WINNER": RiskClass.HIGH_RISK_EXECUTION,
  "Inge:SCRAPE_CHANNEL": RiskClass.READ_ONLY,
  "Inge:DRAFT_EMAIL": RiskClass.DRAFT_PROPOSAL,
  "Inge:SEND_OUTREACH": RiskClass.HIGH_RISK_EXECUTION,

  // Martin (IT Ops)
  "Martin:QUERY_KNOWLEDGE_BASE": RiskClass.READ_ONLY,
  "Martin:DRAFT_SUPPORT_REPLY": RiskClass.DRAFT_PROPOSAL,

  // Denny (Compliance)
  "Denny:READ_DOCUMENT": RiskClass.READ_ONLY,
  "Denny:VERIFY_COMPLIANCE": RiskClass.OPERATIONAL_WRITE,
  "Denny:FLAG_FOR_REVIEW": RiskClass.HIGH_RISK_EXECUTION,
};

/** Default risk class for unmapped actions */
const DEFAULT_RISK = RiskClass.HIGH_RISK_EXECUTION;

export function evaluateAgentAction(
  agent: string,
  action: string
): RiskClass {
  const key: AgentActionKey = `${agent}:${action}`;
  return RISK_MAPPINGS[key] ?? DEFAULT_RISK;
}

export { RISK_MAPPINGS };
