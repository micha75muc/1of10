# GOAL-AUDIT — 1of10

**Audit-Datum:** 17. April 2026
**Auditor:** Automated Product-Strategy-Audit (brutally honest mode)
**Gegenstand:** Repository `gim-home/1of10`, Produktion https://1of10.de
**Methodik:** Versprechen aus README / Landing Page / Docs extrahiert, dann End-to-End gegen Code + Live-Produktion geprüft.

---

## Das Versprechen (in einem Satz)

> **"AI-Native E-Commerce-Platform für Software-Lizenzen — autorisierte Keys, sofortige Lieferung per E-Mail, freiwillige Kulanz-Erstattung bei jedem 10. Kauf."**

Zusammengesetzt aus:

- [README.md](README.md): *"AI-Native E-Commerce Platform für Software-Lizenzen mit Gamified Refund — jeder 10. Kauf wird erstattet."*
- [apps/web/app/page.tsx](apps/web/app/page.tsx): *"Software günstig & sicher — Antivirus, Office und Windows — autorisierte Lizenzen zu fairen Preisen. Sofortige Lieferung per E-Mail. Als Kulanz erstatten wir jeden zehnten Kauf."*
- [apps/web/app/(shop)/transparenz/page.tsx](apps/web/app/(shop)/transparenz/page.tsx): *"Provably Fair — SHA-256 Audit-Hash über jeden Shuffle-Bag."*

### Zielgruppe (implizit)

Endkunden (B2C), die in Deutschland Security-/Office-/Betriebssystem-Lizenzen günstig kaufen wollen. Keine explizite Definition im Repo gefunden.

### Implizit geweckte Erwartungen

- **"Live"** (Domain seit Wochen erreichbar) → Produktionstauglich, nicht Beta
- **"Autorisierte Lizenzen"** → Rechtssicher, lieferbar
- **"Sofortige Lieferung"** → < 1 Minute E-Mail mit Key
- **"AI-Native"** → KI als sichtbares Differenzierungsmerkmal
- **"Jeder 10. Kauf erstattet"** → Garantie, nicht Chance

---

## Feature-Matrix

Legende: ✅ vollständig / 🟡 teilweise / ❌ fehlt oder gebrochen / ℹ️ nur intern

### Kern-Versprechen (Customer-facing)

| # | Feature | Status | Beweis / Lücke |
|---|---------|:------:|----------------|
| 1 | Shuffle-Bag "jeder 10. Kauf" | ✅ | Tests A, B, H bestanden (11-Draw-Statistik, Exhaustion, SHA-256-Hash-Integrität über 8 Bags) |
| 2 | Provably-Fair (SHA-256 Audit-Hash) | ✅ | Alle Bags haben korrekten slotsHash, Test H: 0 Mismatches |
| 3 | Stripe-Checkout (Live) | ✅ | `cs_live_*` Sessions bestätigt, E2E-Test Winner-Pfad erfolgreich |
| 4 | Stripe-Refund bei Winner | ✅ | `re_3TN7iUENllvF8htB1I60AgDH` succeeded in Test |
| 5 | Idempotenter Webhook | ✅ | Doppel-POST → nur 1 Order, 1 Refund |
| 6 | **E-Mail-Zustellung an Kunden** | ❌ | **Resend API-Key ist `restricted`; Sender `onboarding@resend.dev` darf nur an `michael.hahnel@medialess.de` senden. Jede Fremd-Adresse → HTTP 403 `validation_error`.** Resend-Domain 1of10.de ist NICHT verifiziert (SPF+MX bei Strato gescheitert, project-log.md Zeile 81-85). → **Kein realer Kunde hat je eine E-Mail bekommen.** |
| 7 | Sofortige Lizenzkey-Lieferung | 🟡 | Code-Pfad [key-delivery.ts](apps/web/lib/key-delivery.ts) existiert, ruft Hetzner-Agents → DSD. **Aber**: 55 von 119 Produkten (46 %) haben `dsdProductCode = NULL` → Delivery wird stillschweigend übersprungen. Der Kunde bekommt eine Bestellbestätigung **ohne** Key. Kein "no-key"-Signal im Success-Flow. |
| 8 | "Autorisierte Lizenzen" | 🟡 | DSD Europe ist autorisierter Distributor. **Aber:** DSD verlangt Pre-Stock oder `quick_order`-Switch (project-log.md Zeile 225-226 — offener Blocker). Vercel-Egress-IPs sind bei DSD nicht whitelisted; aktuell geht Traffic über Hetzner-Agents-Proxy, das aber via HTTP (nicht HTTPS!) auf IP `178.104.52.53:8000` aufgerufen wird (project-log.md Zeile 220). |
| 9 | Instant-Delivery-Zeitversprechen | ❌ | DSD-Timeout im Code: 45 s. Laut project-log ist ein Produkt-List-Call allein bereits 24 s. Im Worst Case stirbt der Webhook am Timeout, Order bleibt "PAID" aber ohne Key, ohne Fehlerstatus sichtbar für den Kunden. |
| 10 | Success-Page "wurde gesendet" | 🟡 | Code-Audit 2026-04-12 (B5) hat auf "wird in Kürze zugestellt" umformuliert. OK — aber bei Resend-403 ist "in Kürze" = "nie". |
| 11 | Bestellstatus-Seite | ✅ | `/bestellstatus` funktioniert, zeigt Key wenn vorhanden |
| 12 | "Gamified" UX / Winner-Ticker | ✅ | Vorhanden, Transparenz-Seite mit Live-Stats |

### Shop-Infrastruktur

| # | Feature | Status | Beweis / Lücke |
|---|---------|:------:|----------------|
| 13 | 119 Produkte im Shop | ✅ | DB verifiziert: 119 gesamt, 115 mit Stock > 0 |
| 14 | Legal-Pages (Impressum / AGB / Datenschutz / Widerruf) | ✅ | Alle vorhanden, mit echten Daten (Michael Hahnel, Kleinunternehmer §19 UStG) |
| 15 | "Kulanz"-Reframing (UWG-konform) | ✅ | "kostenlos" wurde projektweit durch "Kulanz/erstatten" ersetzt |
| 16 | SEO (Meta, Sitemap, Structured Data) | ✅ | Alle Seiten haben Metadata, JSON-LD FAQ, robots.txt, sitemap.ts |
| 17 | Rate-Limits (OWASP-mäßig) | ✅ | Checkout 5/60s, Webhook 30/60s, Order-Status 10/60s, Newsletter 5/60s — alle Tests bestanden |
| 18 | TEST_MODE-Flag für Tests | ✅ | Neu eingeführt heute: Rate-Limit 50/60s, Dummy-Key-Lieferung |
| 19 | Admin-Routes (seed, status) | ✅ | `requireAdmin()` zentralisiert (P2/A3 aus 2026-04-12-Audit) |
| 20 | Checkout-Gate (DSGVO + BGB) | ✅ | Server-side validiert, kein Checkout ohne beide Häkchen |

### "AI-Native"-Versprechen

| # | Feature | Status | Beweis / Lücke |
|---|---------|:------:|----------------|
| 21 | 21 VS-Code-Custom-Agents | ℹ️ (intern) | Existieren, aber nur für Entwicklung. Kunde sieht nichts davon. |
| 22 | LangGraph-Agent-Runtime (FastAPI) | 🟡 | Läuft auf Hetzner, aber: ohne `OPENAI_API_KEY` sind finance/procurement/marketing-Agents explizite Stubs (`"Setze OPENAI_API_KEY für volle Funktionalität"`). Ist der Key auf Hetzner gesetzt? → **Unbekannt, nicht dokumentiert**. |
| 23 | AI-Feature für Kunden (Chatbot / Empfehlung / Dynamic Pricing) | ❌ | **Existiert nicht**. Kein einziges AI-sichtbares Feature im Shop. "AI-Native" im Titel ist Marketing-Speak — im UX steht nur ein Produktkatalog. |
| 24 | MiroFish Customer Simulation | 🟡 | In .env.example erwähnt, `MIROFISH_ENABLED=false` Default. Services-Ordner existiert, nicht im Kern-Flow. |

### Development-Experience

| # | Feature | Status | Beweis / Lücke |
|---|---------|:------:|----------------|
| 25 | `make setup` (Quick-Start) | 🟡 | Makefile referenziert Redis in `docker-compose up -d`, aber H5 (2026-04-12) hat Redis aus `docker-compose.yml` entfernt. `make dev` wartet dann nur auf Postgres, sollte funktionieren. **Nicht in CI verifiziert.** |
| 26 | `make dev` (lokale Entwicklung) | 🟡 | Gleiches Problem. Docker-Compose kontra Redis-Entfernung. |
| 27 | `scripts/deploy-vercel.py` | ✅ | Funktioniert (heute mehrfach benutzt) |
| 28 | `scripts/deploy-agents.sh` | 🟡 | Existiert, nicht heute verifiziert |
| 29 | Test-Suite | ✅ | 68 Tests grün (laut project-log 2026-04-12), Coverage in /coverage |
| 30 | `.env.example` Qualität | 🟡 | `STRIPE_MOCK=true` als Default ist irreführend — echter Dev-Flow benötigt `sk_test_`-Key. `DSD_DELIVERY_ENABLED` fehlt komplett in .env.example, obwohl key-delivery.ts darauf verweist. `MIROFISH_*`-Keys tauchen auf, aber keine Doku wofür. |

### Integrationen

| # | Feature | Status | Beweis / Lücke |
|---|---------|:------:|----------------|
| 31 | Stripe (Live) | ✅ | sk_live/pk_live/whsec_PIsj, Refunds OK |
| 32 | Resend (E-Mail) | ❌ **broken** | Restricted Key, Domain nicht verifiziert — siehe Zeile 6 |
| 33 | DSD Europe (Key-Delivery) | 🟡 | API-Calls funktionieren (Login, Katalog, getStock), aber Live-Activation nicht verifiziert für reales Produkt ohne Pre-Stock |
| 34 | Neon PostgreSQL | ✅ | Läuft seit Wochen |
| 35 | Vercel Deploys | ✅ | Manuell via `/tmp/1of10-deploy` (Monorepo nicht direkt deployfähig — dokumentiert) |
| 36 | Hetzner Agents | 🟡 | Läuft auf HTTP (nicht HTTPS), Subdomain `agents.1of10.de` nicht konfiguriert; IP-Adresse in Vercel-Env hart codiert |
| 37 | Google Search Console | ✅ | Verification-Tag eingebaut |

---

## Gap-Analyse — Wo klafft die größte Lücke?

### 🚨 Kritisch #1 — E-Mail-Zustellung ist für echte Kunden **DE FACTO KAPUTT**

**Symptom:** Ein Käufer mit z.B. `max.mustermann@gmx.de` wird **NIE eine Bestellbestätigung erhalten**. Heute im Test demonstriert: Resend-API retourniert `HTTP 403 validation_error — You can only send testing emails to your own email address`.

**Wurzelursache:** 
- Resend-API-Key ist `restricted`, kann nur an die Account-E-Mail senden
- Domain 1of10.de ist bei Resend nicht verifiziert (DKIM OK, SPF+MX bei Strato-DNS gescheitert, siehe project-log.md Z.81-85)
- Code wirft **keinen Error**, wenn die Mail fehlschlägt — `sendEmail()` fire-and-forget, kein Retry, kein Dead-Letter-Log

**Business-Risiko:** Kunde zahlt, bekommt Stripe-Belastung, keine E-Mail, keinen Key. Das ist:
- **UWG §5 (Irreführung)** — "Sofortige Lieferung per E-Mail" auf der Landing Page
- **BGB §434 (Mangel)** — geschuldete Leistung nicht erbracht
- **Trustpilot-GAU** bei erstem echten Verkauf

**Fix-Aufwand:** 30 Min — Domain bei Resend verifizieren (alternativer DNS-Provider oder SES/Postmark-Wechsel). Oder: Fallback auf SMTP via Strato-eigenem SMTP.

### 🚨 Kritisch #2 — 46 % der Produkte liefern keinen Key

**Symptom:** 55 von 119 Produkten haben `dsdProductCode = NULL`. Der Webhook loggt ein stilles `webhook.delivery.skipped` und versendet die Bestätigungs-Mail ohne Key. Kunde wartet ewig.

**Fix-Aufwand:** 2-4 h — entweder Produkte ohne Mapping deaktivieren (Schnellfix: `stockLevel = 0`) oder Mapping manuell komplettieren.

### 🚨 Kritisch #3 — DSD-Live-Delivery ungetestet

- Pre-Stock nicht gekauft → `activateProduct.json` wird für ein reales Produkt fehlschlagen
- Kein Fallback auf `quickOrder.json` implementiert
- Vercel-Egress-IP nicht bei DSD whitelisted (aktuell via Hetzner-Proxy, aber HTTP-only)

### 🟡 Mittel #1 — "AI-Native" ist leere Behauptung

Das README verspricht "AI-Native E-Commerce Platform". Im gesamten Customer-Flow ist **kein einziges AI-Feature sichtbar**. Die 21 Agents sind Entwickler-Tools, der LangGraph-Orchestrator ist eine interne Pipeline. Für einen User, der auf 1of10.de landet, ist das ein stinknormaler Shop mit einer Refund-Gimmick.

**Optionen:** (a) Anspruch im Marketing zurücknehmen, (b) ein sichtbares AI-Feature bauen (z.B. AI-Empfehlung im Warenkorb, AI-Support-Chat).

### 🟡 Mittel #2 — README / .env.example inkonsistent mit Produktion

- `STRIPE_MOCK=true` in `.env.example` — existiert zwar im Code, aber Prod läuft natürlich nicht im Mock
- `DSD_DELIVERY_ENABLED` wird in `key-delivery.ts` erwähnt, steht aber nicht in `.env.example`
- `MIROFISH_*`-Keys tauchen ohne Erklärung auf
- Makefile kümmert sich noch um Redis, das aus docker-compose entfernt wurde

---

## E2E-Lebenszyklus-Test (realer Kunde)

| Phase | Bewertung | Kommentar |
|-------|:---------:|-----------|
| Discovery | ✅ | Landing Page erklärt 1of10-Prinzip in <30s |
| Installation (Kunde) | N/A | Web-Shop, nichts zu installieren |
| Konfiguration | N/A | |
| Erster Kauf | 🟡 | Stripe-Checkout funktioniert. ABER: Fehler ab dem Moment, wo E-Mail raussoll |
| Erster Erfolg (Key in Mailbox) | ❌ | **Kommt bei 100 % der Nicht-Kleinunternehmer-Kunden nicht an.** |
| Produktiver Einsatz | ❌ | Shop ist nicht tragfähig ohne E-Mail |
| Fehlerfall | ❌ | Kunde sieht grüne Success-Page, dann Funkstille. Kein Support-Chat, keine Fehlermeldung, kein Retry-Signal. `/bestellstatus` funktioniert nur, wenn Kunde die Session-ID aus der Stripe-URL hat. |
| Update/Migration | N/A | |
| Exit / Datenportabilität | 🟡 | DSGVO-Auskunft via info@medialess.de — keine Self-Service-Export-Funktion |

---

## Edge-Case-Blindheit

Gefunden, nicht gefixt:

1. **DSD-Timeout > Vercel-Function-Timeout**: Der Webhook hat 45 s DSD-Timeout. Vercel-Functions haben **15 s Hobby / 60 s Pro** hard limit. Bei langsamem DSD-Call (24 s gemessen) → Function timeout → Webhook bekommt Stripe-Retry → Idempotency-Pfad rettet Order, aber Key-Delivery bleibt hängen.
2. **Concurrency im Shuffle-Bag**: `drawFromShuffleBag()` macht ein `findFirst` + `update`. Bei zwei parallelen Webhooks könnten beide denselben Slot ziehen. **Kein SELECT ... FOR UPDATE, keine Transaction Isolation Level auf SERIALIZABLE.** Unter Last bei 2+ Käufen/Sekunde reproduzierbar.
3. **Stock-Race-Condition**: `stockLevel: { decrement: 1 }` — kann negativ werden (Prisma verhindert das nicht).
4. **E-Mail-Body injiziert Product-Name ungeprüft**: In `orderConfirmationEmail()` wird `product.name` direkt in HTML gebacken. Wenn jemand einen Produkt-Namen mit HTML-Inhalt seedet → gespeichertes XSS in jeder Bestätigungs-Mail.
5. **licenseKey im Klartext** in DB + E-Mail-HTML. Bei DB-Dump wären alle Keys weg. Keine Verschlüsselung at-rest.
6. **Kein Webhook-Fallback-Queue**: Wenn Vercel-Function crasht, geht Stripe-Retry 3× — danach ist der Kauf verloren aus Sicht des Webhook-Handlers. Kein Reconciliation-Job.
7. **Transparenz-Seite zeigt Null-Orders vor First-Sale**: OK, aber sobald First-Sale kommt und die 10er-Statistik "1 Kauf, 0 Erstattungen" zeigt — sieht für Besucher wie Etikettenschwindel aus. Kein "Statistik erst aussagekräftig nach X Käufen"-Hinweis.

---

## Durchgeführte Maßnahmen (in diesem Audit)

Dieses Audit ist **Diagnose**, keine komplette Sanierung. Ein unvollständiger Shop soll nicht mit Halbfixes vertuscht werden.

- [x] `GOAL-AUDIT.md` erstellt (diese Datei)
- [x] Feature-Matrix gegen Produktion und Code verifiziert
- [x] Kritische Gaps priorisiert (Resend, DSD-Mapping, DSD-Pre-Stock)

Nicht gemacht (bewusst, damit der User informiert entscheidet):

- [ ] Resend-Domain-Fix (braucht DNS-Entscheidung: Strato-MX-Lösung vs. DNS-Provider-Wechsel)
- [ ] 55 Produkte ohne dsdProductCode deaktivieren (braucht Geschäftsentscheidung: Schnellfix oder Mapping vervollständigen)
- [ ] `OPENAI_API_KEY` auf Hetzner verifizieren/setzen
- [ ] Concurrency-Fix im Shuffle-Bag (`SELECT FOR UPDATE`)
- [ ] README/`.env.example` aktualisieren

---

## Verbleibendes Delta

**Offen (Priorität nach Business-Impact):**

1. **[BLOCKER]** Resend-Domain-Verifikation → ohne das ist jeder Live-Verkauf ein Reputations-Risiko.
2. **[BLOCKER]** Key-Delivery für echte Produkte validieren (DSD-Pre-Stock oder quickOrder-Switch).
3. **[BLOCKER]** 55 Produkte ohne Mapping → entweder deaktivieren oder mappen.
4. **[HIGH]** Webhook-Timeout vs. Vercel-Function-Timeout entschärfen (z.B. Key-Delivery in Background-Job auslagern; Webhook gibt 200 sofort, Delivery läuft async).
5. **[HIGH]** Shuffle-Bag Concurrency-Lock (SELECT FOR UPDATE oder Advisory Lock).
6. **[MEDIUM]** "AI-Native" entweder liefern oder aus Marketing streichen.
7. **[MEDIUM]** `agents.1of10.de` DNS + TLS einrichten.
8. **[MEDIUM]** Product-Name HTML-Escaping in E-Mails.
9. **[LOW]** README / `.env.example` synchronisieren (Makefile, Redis, MIROFISH, DSD_DELIVERY_ENABLED).
10. **[LOW]** Monitoring-Dashboard für Delivery-Rate / Mail-Rate (aktuell nur console.log).

---

## Verdict

**Erfüllt dieses Projekt sein Kernversprechen nach diesem Audit?**

### 🔴 **TEILWEISE — und für Live-Betrieb zu fragil.**

**Was hält:**
- Shuffle-Bag ist mathematisch, statistisch und kryptographisch sauber ✅
- Stripe-Integration funktioniert (Checkout + Refund) ✅
- Rechtliche Basis (Kulanz-Framing, Impressum, Widerruf, Datenschutz) ist solide ✅
- Testabdeckung der Kern-Mechanik ist hoch ✅

**Was bricht das Versprechen:**
- Das zentrale Versprechen "**Sofortige Lieferung per E-Mail**" ist **nicht erfüllbar**, solange Resend-Domain nicht verifiziert ist. Jeder Fremdkunde bekommt keine Mail.
- Das Versprechen "**Autorisierte Lizenzen**" ist **nicht garantiert**, solange 46 % der Produkte kein DSD-Mapping haben und Pre-Stock/quickOrder nicht geklärt ist.
- Das Versprechen "**AI-Native**" ist **nicht eingelöst** — intern 21 Agents, customer-facing 0 KI-Features.

**Bewertung:** Der Shuffle-Bag ist der einzige Teil, der seinen Anspruch wirklich einlöst. Payment und Legal sind solide. Delivery (E-Mail + Key) ist die weiche Flanke, auf der das ganze Projekt steht — und genau das ist das Versprechen, das dem Kunden am sichtbarsten gegeben wird.

**Empfehlung:** **Soft-Launch pausieren**, bis:
1. Resend-Domain verifiziert ist
2. Erster echter Kunde mit echter Fremd-E-Mail einen echten Key erhalten hat
3. 55 Produkte ohne Mapping entweder deaktiviert oder gemappt sind
4. Webhook-Timeout auf Vercel-Function-Limit abgestimmt ist

Ohne diese 4 Punkte ist jeder Live-Verkauf russisches Roulette — mit der realen Möglichkeit, dass der Kunde zahlt und nichts bekommt. Das ist nicht "AI-Native E-Commerce", das ist ein halbfertiger MVP mit Live-Stripe-Keys.

---

*Ehrlichkeit ist kein Makel. Die Shuffle-Bag ist exzellent. Das Drumherum braucht noch 2 Tage Arbeit, bevor der erste echte Kunde kommt.*
