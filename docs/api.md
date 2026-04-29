# API Reference — 1of10

Diese Datei dokumentiert alle HTTP-Endpunkte des Next.js-Apps unter
`apps/web/app/api/`. Alle Endpunkte verwenden `NextRequest` /
`NextResponse` und sind Edge-incompatible (sie nutzen Prisma → Node-Runtime).

Alle Endpunkte liegen hinter dem In-Memory-Rate-Limiter (`lib/rate-limit.ts`).
Limits sind in [`apps/web/lib/constants.ts`](../apps/web/lib/constants.ts)
versioniert.

> Auth-Modell:
> - **Public** — keine Auth, nur Rate-Limit
> - **Webhook** — Stripe-HMAC-Signaturprüfung + Rate-Limit
> - **Admin** — Cookie-Session (HMAC-signiert) ODER `x-admin-api-key` Header
> - **Customer-knows-session** — Caller muss die Stripe `session_id` kennen

## Public Endpoints

### `POST /api/checkout`
Erstellt eine Stripe-Checkout-Session für einen Produktkauf.

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `productId` | string | ✓ | Produkt-ID aus DB |
| `dsgvoOptIn` | boolean | ✓ | Datenschutz-Bestätigung |
| `bgbWiderrufOptIn` | boolean | ✓ | Verzicht auf Widerrufsrecht |

**Response:** `{ url: string, sessionId: string }`
**Errors:** 400 (Validierung), 429 (Rate-Limit), 500 (mit `errorId` für
Support).
**Rate-Limit:** 10 / Minute pro IP.

### `GET /api/order-status?sessionId=cs_xxx`
Liefert den aktuellen Status einer Bestellung. Wird vom
`/checkout/success` Polling benutzt während der Stripe-Webhook noch in
Bearbeitung ist.

**Response:** `{ status, isWinner, refundStatus, productName, licenseKey, deliveredAt }`
**Errors:** 400 (sessionId fehlt), 404 (unbekannt), 429.
**Rate-Limit:** 10 / Minute pro IP.

### `POST /api/orders/{orderId}/resend`
Sendet die Bestätigungsmail erneut. Auth: Caller muss die zur Order
gehörige `sessionId` mitliefern.

**Body:** `{ sessionId: string }`
**Response:** `{ ok: true }`
**Errors:** 400 (sessionId fehlt), 404 (Order nicht gefunden — bewusst
generisch, kein Existenz-Leck), 429.
**Rate-Limit:** 3 / 5 Minuten pro IP.

### `POST /api/newsletter`
Newsletter-Anmeldung.

**Body:** `{ email: string }`
**Response:** `{ success: true }`
**Errors:** 400 (Email-Format), 429 (Rate-Limit), 500.
**Rate-Limit:** 5 / Minute pro IP.

## Webhook

### `POST /api/webhooks/stripe`
Stripe-Webhook-Handler. Akzeptiert nur Events mit valider HMAC-Signatur
(`stripe-signature` Header + `STRIPE_WEBHOOK_SECRET`).

**Verarbeitete Events:**
- `checkout.session.completed` — Order anlegen, Shuffle-Bag ziehen,
  ggf. Refund auslösen, Lizenzkey via DSD bestellen, Confirmation-Mail
  senden.
- `charge.dispute.created` — Loggen + Order markieren.

**Idempotenz:** Über `Order.stripeSessionId` Unique-Constraint. Doppelte
Webhooks (Stripe-Retries) sind safe — bei `FAILED` Refund-Status wird
einmalig retried, sonst no-op.

**Response:** 200 mit `{ received: true, orderId? }`
**Errors:** 400 (fehlende/invalide Signatur), 500 (intern).
**Rate-Limit:** 30 / Minute (Stripe-Retries machen max 3/Event).

## Admin Endpoints

Alle Endpunkte verlangen entweder:
- gesetztes `1of10_session` Cookie (HMAC-validiert, 24h TTL), ODER
- `x-admin-api-key: $ADMIN_API_KEY` Header.

### `GET /api/admin/approvals?status=PENDING`
Listet Approval-Items aus der ApprovalItem-Queue. Filter via Query-Param
`status` (Default `PENDING`, `ALL` für alle).

### `POST /api/admin/approvals`
Legt einen Approval-Item an. Wird intern von Agents (Nestor, Denny, …)
über die Policy-Engine aufgerufen.

**Body:** `{ agentId, actionType, payload }`

### `PATCH /api/admin/approvals/{id}`
Approve oder Reject ein Item. Bei `APPROVED` wird der Action-Dispatcher
ausgeführt (siehe `lib/action-dispatcher.ts`).

**Body:** `{ action: "APPROVED" | "REJECTED", approvedBy?: string }`

### `GET /api/admin/analytics`
Aggregierte Analytics für das Admin-Dashboard (Order-Counts pro Tag,
Conversion-Rates, …).

### `GET /api/admin/export`
CSV-Export aller Bestellungen für Buchhaltung. Schema siehe Code.

### `GET /api/admin/shuffle-bag/status`
Status des aktuellen Shuffle-Bags (Größe, Index, Hash). Siehe
[ADR-001](adr/ADR-001-shuffle-bag.md).

### `POST /api/admin/shuffle-bag/seed`
Erstellt einen neuen Shuffle-Bag. Nur sinnvoll wenn keiner aktiv ist
(unique-by-active Constraint).

## Konventionen

- Alle 4xx/5xx Antworten verwenden Body-Format `{ error: string, errorId?: string }`.
- 5xx-Antworten loggen via `lib/error-logger.ts → logError(err, { event })`.
- Rate-Limit-Window kommt aus `lib/constants.ts`. Magic numbers im Route-Body
  sind ein Code-Review-Stop.
- Personenbezogene Daten in Logs werden gehasht (zb. Email
  `xx***@example.com`).
