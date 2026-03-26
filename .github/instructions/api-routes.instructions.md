---
description: "API route security and conventions for 1of10. Rate limiting, auth, response format."
applyTo: "apps/web/app/api/**"
---

# API Route Conventions — 1of10

## Authentication
- Admin routes (`/api/admin/*`): Check BOTH `x-admin-api-key` header AND session cookie
- Use `checkAdminAuth()` helper — accepts API key (agents) or session (browser UI)
- Public routes: No auth, but ALWAYS rate-limit

## Rate Limiting
- EVERY public endpoint needs rate limiting. No exceptions.
- Pattern: IP-based, in-memory Map with time window
- Checkout: 5 req/min
- Newsletter: 5 req/min  
- Order Status: 10 req/min
- Webhook: 30 req/min

## Response Format
- Success: `NextResponse.json({ ...data })` with status 200
- Client error: `NextResponse.json({ error: "message" }, { status: 4xx })`
- Server error: `NextResponse.json({ error: "Internal error" }, { status: 500 })`
- NEVER expose internal error details to clients

## Logging
- Use structured JSON: `{ level, event, timestamp, ...details }`
- NEVER log PII (emails) in cleartext — mask: `email.replace(/(.{2}).*(@.*)/, "$1***$2")`
- Remove `console.log` debug statements before committing

## Webhook Security
- ALWAYS verify Stripe webhook signature via `constructEvent()`
- Handle idempotency: check for existing order before creating
- Log disputes (`charge.dispute.created`) — don't silently ignore
