---
description: "TypeScript coding standards for 1of10. Enforces strict typing, German price formatting, and Next.js conventions."
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Standards — 1of10

## Strict Mode
- NO `any` types. Use `unknown` + type guards if type is genuinely unknown.
- Enable `strict: true` in tsconfig. No exceptions.

## Naming
- Components: PascalCase (`ProductImage`, `CheckoutForm`)
- Functions/variables: camelCase (`sellPrice`, `handleSubmit`)
- Constants: UPPER_SNAKE (`BASE_URL`, `SESSION_COOKIE`)
- Files: kebab-case (`product-image.tsx`, `shuffle-bag.ts`)

## German Locale
- Prices ALWAYS: `Number(x).toFixed(2).replace(".", ",")` + ` €`
- NEVER show `219.99 €` — always `219,99 €`
- Exception: Schema.org JSON-LD uses dot notation (international standard)
- Exception: Stripe API uses cents (integer), not formatted strings

## Imports
- Prefer relative imports within the same package
- Use `@repo/db` and `@repo/policy` for cross-package imports
- Lucide icons: `import { Gift, Shield } from "lucide-react"` — NO emoji icons in UI

## Error Handling
- API routes: try/catch with structured JSON error responses
- Never throw raw errors to the client
- Log errors server-side with `console.error` (structured JSON preferred)
