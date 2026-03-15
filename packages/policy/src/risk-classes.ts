export enum RiskClass {
  /** Read-only data access — no approval needed */
  READ_ONLY = 1,
  /** Draft/proposal creation — logged, no blocking approval */
  DRAFT_PROPOSAL = 2,
  /** Operational write (e.g. update price) — logged to DB */
  OPERATIONAL_WRITE = 3,
  /** High-risk execution (e.g. purchase keys, publish winner) — requires human approval */
  HIGH_RISK_EXECUTION = 4,
}
