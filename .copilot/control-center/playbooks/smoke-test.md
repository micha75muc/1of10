# Playbook — End-to-End Smoke-Test (vor jedem Live-Deploy)

> O1 — Pre-Launch + jeder Production-Deploy. Manuell, ca. 10 Minuten.

## Ziel

Vollständigen Kauf-Lifecycle in Stripe-**Test-Mode** durchspielen und prüfen,
dass:

1. Checkout-Session startet
2. Stripe-Webhook eintrifft, Order in DB landet
3. DSD-Sandbox liefert License-Key
4. Bestellbestätigung erreicht den Kunden
5. Status-Page (`/order-status`) zeigt korrekte Daten
6. Bei Winner: Refund läuft durch, REFUNDED in DB
7. Admin-Health zeigt 200 OK

## Voraussetzungen

- Vercel Preview-Deploy (oder lokal `pnpm --filter web dev`)
- `.env` mit Stripe-Test-Keys (`sk_test_...` + `pk_test_...`)
- DSD Sandbox-Zugang (Jody van Gils — siehe `contacts.md`)
- ADMIN_API_KEY oder Admin-Login

## Test 1 — Standard-Kauf (kein Winner)

1. Browser öffnen: `https://<preview-url>/products`
2. **Erwarte:** Trust-Bar oben (Sofort-Lieferung / Stripe / DE / SSL / Original-Keys)
3. Produkt mit `dsdProductCode != null` wählen, z.B. `bitdefender-total-security-1y-1`
4. **Erwarte PDP:** Vendor-Account-Badge (falls vorhanden), UVP durchgestrichen, Standard- oder Custom-FAQ.
5. „Jetzt kaufen" → Stripe-Checkout
6. **Stripe Test-Karte:** `4242 4242 4242 4242`, MM/YY beliebig zukünftig, CVC `123`, Adresse zwingend ausfüllen.
7. Submit → Redirect auf `/checkout/success?session_id=...`
8. **Erwarte Success-Page:** kein „Gewinner!"-Banner (außer Bag-Position triggert).
9. Mailbox prüfen → Bestellbestätigung mit License-Key + Widerrufsbelehrung.
10. Status-Page öffnen: `https://<preview-url>/order-status`. E-Mail + Session-ID eingeben.
11. **Erwarte:** Order-Card mit License-Key und Status `DELIVERED`.

## Test 2 — Winner-Lauf

1. Bag manuell auf 1-Slot setzen (Admin):
   ```
   POST /api/admin/shuffle-bag/seed
   Headers: x-admin-api-key: <ADMIN_API_KEY>
   Body:    { "size": 2, "winnerCount": 1 }
   ```
   → Aktiver Bag hat 2 Slots, einer ist Winner.
2. Zwei Käufe nacheinander mit Test-Karte. Eine davon wird **garantiert** Winner.
3. **Erwarte beim Winner:**
   - Success-Page mit gelbem Winner-Block + „Freiwillige Kulanzleistung" Hinweis
   - Stripe-Dashboard: Refund mit `idempotency-key=refund-<orderId>` sichtbar, COMPLETED
   - Order in DB: `status=REFUNDED`, `refundStatus=COMPLETED`, **license-Key trotzdem vorhanden**
4. Bag-Status prüfen: `GET /api/admin/shuffle-bag/status` — neuer Bag wurde generiert.

## Test 3 — Failure Modes

### Email-Outage simulieren
1. `RESEND_API_KEY` temporär ungültig setzen
2. Kauf durchführen
3. **Erwarte:**
   - Webhook returned 200 (Order existiert!)
   - `Order.emailError` gesetzt
   - Admin-Alert in `ADMIN_EMAIL` Postfach
4. Korrekten Key wieder setzen
5. `POST /api/admin/orders/<orderId>/retry-email` — Mail wird zugestellt, `emailSentAt` gesetzt.

### DSD-Outage simulieren
1. `DSD_API_KEY` temporär ungültig
2. Kauf
3. **Erwarte:**
   - Order `status=DELIVERY_FAILED`
   - `deliveryError` gesetzt
   - Admin-Alert
4. Key wieder setzen
5. `POST /api/admin/orders/<orderId>/retry-delivery` — License kommt nach.

## Test 4 — Health-Endpoint

```
GET /api/admin/health
Authorization: x-admin-api-key: <ADMIN_API_KEY>
```

Nach Tests 1-3 (mit zurückgesetzten Errors): **erwarte** alle Sektionen `ok: true`.

## Checklist (zum Abhaken)

- [ ] Test 1 — Standard-Kauf erfolgreich
- [ ] Test 2 — Winner-Refund erfolgreich
- [ ] Test 3a — Email-Retry erfolgreich
- [ ] Test 3b — Delivery-Retry erfolgreich
- [ ] Test 4 — Health alle grün
- [ ] CSP / Security-Header geladen (Browser-DevTools → Network → Response Headers)
- [ ] Cookie-Banner zeigt informational notice (nicht „Akzeptieren/Ablehnen")
- [ ] /transparenz zeigt aktiven Bag-Hash
- [ ] /vergleich rendert Cards auf Mobile (DevTools → iPhone-Größe)
- [ ] Mobile sticky CTA auf PDP

## Auto-Test-Idee (für später)

Playwright-Test der Test-1-Sequenz gegen die Vercel-Preview, ausgelöst aus
`.github/workflows/preview-smoke.yml`. Aktuell bewusst manuell, weil Stripe-
Webhook-Testing in CI komplex (Stripe CLI tunnel) und der manuelle Lauf
ohnehin pflicht ist.

## Verantwortlich

- Manueller Run: Michael Hahnel oder beauftragter Tester
- Frequenz: vor jedem Live-Deploy + nach jeder Schema-Migration
