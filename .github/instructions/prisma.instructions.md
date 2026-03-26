---
description: "Prisma schema and database conventions for 1of10. Indexes, queries, migrations."
applyTo: "**/*.prisma,packages/db/**"
---

# Prisma & Database Conventions — 1of10

## Schema
- Every model needs `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
- Add `@@index` for every field used in `where`, `orderBy`, or `findMany` filters
- Use `Decimal` for money (costPrice, sellPrice, amountTotal) — never Float

## Queries
- Always use `select` to fetch only needed fields
- Use `where: { stockLevel: { gt: 0 } }` for customer-facing product queries
- Use transactions for multi-step writes (ShuffleBag draw + Order create)
- Idempotency: Use unique constraints (stripeSessionId) to prevent duplicates

## Migrations
- `npx prisma db push` for development
- Never modify production data without backup verification
- Test schema changes locally before pushing to Neon

## Security
- NEVER expose costPrice to frontend/client code
- Rate-limit ALL public-facing API routes that query the database
- Use parameterized queries only (Prisma handles this automatically)
