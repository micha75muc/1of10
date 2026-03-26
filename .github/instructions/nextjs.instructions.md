---
description: "Next.js App Router conventions for 1of10 shop. Server Components, Prisma queries, meta tags, accessibility."
applyTo: "apps/web/app/**"
---

# Next.js Conventions — 1of10

## Server vs Client
- Default: Server Components. Only add `"use client"` for event handlers, state, browser APIs.
- NEVER put secrets, API keys, or costPrice in `"use client"` files — they ship to the browser.
- Server Actions: Use for form submissions. They have built-in CSRF protection.

## Data Fetching
- Use Prisma directly in Server Components: `const products = await prisma.product.findMany({...})`
- Always filter `stockLevel: { gt: 0 }` for customer-facing queries
- Use `select` to fetch only needed fields — no `select: *`

## Meta Tags
- Every page needs `export const metadata: Metadata` or `generateMetadata()`
- Include: title, description, alternates.canonical, openGraph
- Product pages: Include `og:image` pointing to `/products/{SKU}.svg`

## JSON-LD
- ALWAYS escape: `JSON.stringify(jsonLd).replace(/</g, "\\u003c")`
- Product schema requires: review, aggregateRating, priceValidUntil, hasMerchantReturnPolicy, shippingDetails

## Accessibility
- Heading hierarchy: h1 → h2 → h3 (never skip levels)
- Skip-link target `id="main-content"` must exist on every page's `<main>`
- All interactive elements need `aria-label` or visible text
- Color contrast: minimum WCAG AA (4.5:1 for text)

## Performance
- Images: Use `<img>` for local SVGs, `next/image` for remote
- SSG (`generateStaticParams`) for all product pages
- `force-dynamic` only where real-time data is needed (checkout, transparenz)
