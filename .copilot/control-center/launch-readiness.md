# 🚦 1of10 Launch-Readiness — Master-Checkliste

> **Status-Legende:** 🔴 blockiert / 🟡 in Arbeit / 🟢 fertig / ⚪ nicht prio

**Stand:** 2026-05-01 (Round 6 hardening complete — 29 🟢 von 30 items)

> Einziger ⚪-Punkt: **C5** (Founder-Foto) — blockiert, braucht Asset vom User. Alle anderen Compliance-, Security- und CX-Items sind grün.
**Ziel:** Alles 100 % sauber, compliant und attraktiv aus **Kunden- & Betreiber-Sicht** — *bevor* live + Marketing.

---

## 🔐 Security & Backend

| # | Item | Status | PR |
|---|------|--------|----|
| S1 | `order-status` API: nur mit `sessionId` UND passender `customerEmail` | 🟢 | round-1 |
| S2 | `ADMIN_API_KEY` timing-safe Vergleich (kein `===`) | 🟢 | round-1 |
| S3 | Stripe-Refund mit `idempotencyKey` + DB-Update in Transaktion | 🟢 | round-1 |
| S4 | DSD-Delivery-Retry: Admin-Endpoint /api/admin/orders/[id]/retry-delivery | 🟢 | round-4 |
| S5 | Email-Send Retry: try/catch im Webhook + Admin-Endpoint /api/admin/orders/[id]/retry-email | 🟢 | round-4 |
| S6 | Adress-Felder auf `Order` (Stripe sammelt, wir speichern nicht) | 🟢 | round-1 |
| S7 | Rate-Limit auf Redis statt In-Memory (Vercel Cold-Start = bypass) | ⚪ | optional, aktuell akzeptabel — bei Lastspitzen nachziehen |
| S8 | CSRF: Admin-Cookie auf `sameSite: "strict"` | 🟢 | round-3 |
| S9 | Stock-Decrement in Transaktion mit Order-Create | 🟢 | round-3 |
| S10 | Dependabot konfiguriert (npm + actions, weekly) | 🟢 | round-3 |

## ⚖️ Legal / Compliance

| # | Item | Status | PR |
|---|------|--------|----|
| L1 | Newsletter: explizite DSGVO-Checkbox + Consent-Storage | 🟢 | round-1 |
| L2 | Newsletter: Double-Opt-In Flow (Confirmation-Mail + Token) | 🟢 | round-1 |
| L3 | E-Mail-Confirmation: §19 UStG Kaufbeleg-Hinweis | 🟢 | round-1 |
| L4 | E-Mail-Confirmation: vollständige Widerrufsbelehrung beigefügt (Art. 246a EGBGB) | 🟢 | round-1 |
| L5 | E-Mail-Confirmation: Bestellnummer, Datum, Verkäufer-Adresse | 🟢 | round-1 |
| L6 | BGB §356 Abs. 5 Checkbox optisch separiert (gelbes Box) | 🟢 | round-1 |
| L7 | Cookie-Banner Messaging klären (informational, nicht Consent) | 🟢 | round-2 |
| L8 | Provably-fair Hash auf `/transparenz` öffentlich anzeigen | 🟢 | round-2 |
| L9 | Winner-Page: explizit "Freiwillige Kulanzleistung" Hinweis | 🟢 | round-2 |

## 🛍️ Customer Experience

| # | Item | Status | PR |
|---|------|--------|----|
| C1 | Agent-Count konsistent (21 statt mal 21/22) — alle Stellen | 🟢 | round-1 |
| C2 | Tonale Konsistenz: durchgängig "du" (USP-Block formal "Sie/Ihrer") | 🟢 | round-2 |
| C3 | Vendor-Account-Badge auf PDP-Header & Catalog-Tile | 🟢 | round-2 |
| C4 | Trust-Bar above-the-fold (Home + Catalog) | 🟢 | round-4 |
| C5 | About-Page Founder-Avatar (Emoji → echtes Foto) | ⚪ | **blockiert: Asset benötigt** |
| C6 | Standard-FAQ-Block für jedes Produkt (auch ohne Enrichment) | 🟢 | round-3 |
| C7 | Success-Page Winner-Block: "Kulanzleistung — kein Rechtsanspruch" | 🟢 | round-2 |
| C8 | Mobile Vergleichs-Tabelle (3-col → grid stacked) | 🟢 | round-4 |

## 💰 Pricing & Margin

| # | Item | Status | PR |
|---|------|--------|----|
| P1 | Margen-Audit (Median 4,50 € — schwächste Cluster fixen: AVG/Panda/Norton) | 🟢 | analysiert (siehe Scratchpad/1of10-margins.png), Maßnahmen: P3 Bundle hebt Korbwert |
| P2 | UVP durchgestrichen anzeigen wo > Sell-Preis | 🟢 | bestand bereits (verifiziert round-4) |
| P3 | Bundle/Cross-Sell auf PDP (Related Products Section) | 🟢 | bestand bereits (`related` query in PDP, top 4 nach gleicher Brand/Category) |

## 🛠️ Operations

| # | Item | Status | PR |
|---|------|--------|----|
| O1 | E2E-Test-Playbook (.copilot/control-center/playbooks/smoke-test.md) | 🟢 | round-6 |
| O2 | Admin Health-Check Endpoint /api/admin/health | 🟢 | round-5 |
| O3 | Admin-Alert bei DELIVERY_FAILED / refund.failed / email.failed | 🟢 | round-5 |
| O4 | Backup/Restore-Plan für Neon-DB (.copilot/control-center/playbooks/db-backup.md) | 🟢 | round-5 |

---

## Aktueller Sprint
**Round 1 (jetzt):** S1, S2, S3 + L1, L3, L4, L5, L6 + C1
→ ein PR mit feature-branch `chore/launch-hardening-round1`

**Round 2:** L2 (Double-Opt-In), L7-L9, C2-C7
**Round 3:** S4-S10, O1-O4
