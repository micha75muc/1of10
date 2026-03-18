# Autoresearch Program

## Objective
Improve the **policy layer** (`packages/policy/src/`) of the 1of10 e-commerce platform.

## What We're Improving
The policy layer evaluates agent actions and assigns risk classes (1-4). It decides whether an action is allowed immediately, needs logging, or requires human approval.

## Allowed Files
- `packages/policy/src/mappings.ts` — Agent-to-RiskClass mapping table
- `packages/policy/src/enforce.ts` — Policy enforcement logic
- `packages/policy/src/risk-classes.ts` — RiskClass enum definition

## What Matters (Metrics)
1. **Build passes** — the app must compile without errors
2. **Type-check passes** — TypeScript types must be correct
3. **Smoke test passes** — basic policy evaluation must return correct results
4. **Code is simpler** — fewer lines, clearer logic (tiebreaker)

## What Is Forbidden
- Do NOT touch payment logic (Stripe, checkout, webhooks)
- Do NOT touch authentication or admin routes
- Do NOT touch database schema or migrations
- Do NOT touch deployment config (.vercel, docker-compose)
- Do NOT touch secrets or environment variables
- Do NOT add new dependencies
- Do NOT change the RiskClass enum values (1-4)
- Do NOT weaken security (e.g., downgrading a HIGH_RISK action to READ_ONLY)

## How to Make Changes
- One small, reversible edit at a time
- Prefer simplification over addition
- Prefer removing dead code over adding new code
- Prefer clearer variable names over clever abstractions
- If score is equal, prefer fewer lines
- If unsure, don't change anything

## Safety Rules
- Always create a baseline first
- Always revert if score drops
- Never auto-push to remote
- Never edit files outside the allowed list
- Log every experiment, even failures
