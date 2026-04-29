# UX-AUDIT — 1of10 Shop (2026-04-29)

> Audit aus Endkunden-Perspektive. Keine Entwickler-Eleganz, kein Refactor-Listing —
> nur Dinge, die einen echten Käufer entweder verwirren, Daten kosten oder zur
> nächsten Tab-Schließung treiben.
>
> Methode: Live-Site (https://1of10.de) durchgespielt + Code-Lesung der zentralen
> User-Surfaces (Layout, PDP, Listing, Checkout, Confirm, Email, Error, 404).

## Severity-Skala
- **🔴 P1 — Datenverlust / Kaputter Happy Path / Vertrauensbruch**
- **🟠 P2 — Fehlerkommunikation / Sackgasse / Validierung**
- **🟡 P3 — Feedback / Loading / Recovery / Konsistenz**
- **🔵 P4 — A11y / Polish / Edge Cases**

---

## 🔴 P1 — Showstopper

### F-1.1 — `/bestellstatus` ist 404, wird aber in JEDER Bestätigungsmail verlinkt
- **Was erlebt der User:** Kunde kauft, bekommt Mail, klickt auf "Bewahre die E-Mail
  auf — du kannst den Schlüssel auch jederzeit unter https://1of10.de/bestellstatus
  einsehen", landet auf "Seite nicht gefunden". Der Lizenzschlüssel ist sein
  einziges Kaufobjekt — und der versprochene Wieder-Zugriff existiert nicht.
- **Was sollte er erleben:** Funktionierender Status-Lookup oder klar formuliertes
  "Schlüssel ist nur per E-Mail verfügbar — bitte Spam-Ordner prüfen".
- **Fix:** Link in `lib/email.ts` zeigt direkt auf `/checkout/success?session_id=…`
  (existiert und zeigt die Order inklusive Key). Plus: neue Status-Seite
  `/bestellstatus` mit Lookup-Form (E-Mail + Session-ID).
- **Severity:** P1 — direkter Vertrauensbruch nach Kauf.

### F-1.2 — Keine Möglichkeit, die Bestätigungsmail erneut anzufordern
- **Was erlebt der User:** Mail im Spam, Mail-Adresse vertippt, Mail aus Versehen
  gelöscht → Lizenzschlüssel weg. Einziger Weg: Mail an info@medialess.de — was
  zeitliche Verzögerung und persönlichen Kontakt erzwingt für etwas, das er gerade
  bezahlt hat.
- **Was sollte er erleben:** Auf der Confirm-Seite einen Button "Bestätigung
  erneut senden" — innerhalb der Session frei verfügbar.
- **Fix:** Endpoint `POST /api/orders/[id]/resend` (rate-limited, prüft Session
  via Cookie / Session-ID-Match), Button auf Success-Seite.
- **Severity:** P1 — User kann sein bezahltes Produkt verlieren / muss Support
  bemühen.

### F-1.3 — Kein User-Feedback bei DSD-Fulfilment-Verzögerung > 60s
- **Was erlebt der User:** Bezahlt, Confirm-Page zeigt "Bestellung wird
  verarbeitet …" — pollt 20× alle 3s = 60s. Wenn DSD länger braucht: timeout-Block
  mit "Bitte kontaktiere uns" — aber die `session_id` ist nirgendwo zum Kopieren,
  Support kann den Vorgang nicht zuordnen.
- **Was sollte er erleben:** Im Timeout-Block die Session-ID/Order-ID zum
  Kopieren mit "Wenn du uns schreibst, gib bitte diese ID an".
- **Fix:** order-pending.tsx zeigt im timeout-Block die `session_id` als
  Copy-Button.

---

## 🟠 P2 — Fehlerkommunikation & Sackgassen

### F-2.1 — Generischer 500 bei `/api/checkout` ("Interner Serverfehler.")
- **Was erlebt der User:** Drückt "Zahlungspflichtig bestellen", bekommt rotes
  Banner mit "Interner Serverfehler.". Keine ID, kein Mail-Link, kein Hinweis ob
  er die Karte testen oder warten soll.
- **Was sollte er erleben:** "Wir konnten dich gerade nicht zur Bezahlung
  weiterleiten. Bitte versuche es in 1 Minute erneut. Wenn das Problem
  bestehen bleibt, schreib uns: info@medialess.de (Fehler-ID: …)"
- **Fix:** Error-ID generieren, `console.error` als JSON mit ID loggen,
  ID im Response zurückgeben. Form rendert sie + Mail-Link.
- **Severity:** P2.

### F-2.2 — Globaler Error-Boundary `app/error.tsx` zeigt keinen Identifier
- **Was erlebt der User:** Allgemeine Fehlerseite ohne Trace-ID. Wenn er den
  Support kontaktiert, kann niemand den Vorfall zuordnen.
- **Was sollte er erleben:** Anzeige `error.digest` (Next.js generiert sie
  automatisch in production builds) und Mail-Link mit der ID vorausgefüllt.
- **Fix:** `app/error.tsx` zeigt digest + Mailto.
- **Severity:** P2.

### F-2.3 — `/checkout/success` ohne `session_id` zeigt nur "Keine Session-ID gefunden"
- **Was erlebt der User:** Sackgasse. "Zurück zum Shop" — aber er WAR gerade
  beim Bezahlen. Was ist mit seiner Bestellung? Hat er bezahlt?
- **Was sollte er erleben:** Hinweis "Wenn du gerade bezahlt hast, prüfe bitte
  deine E-Mails — die Bestätigung kommt in den nächsten Minuten. Falls keine
  Mail kommt: support kontakt".
- **Fix:** Neuer Hinweistext + "Mail nicht angekommen?" Link auf
  `/bestellstatus`.
- **Severity:** P2.

### F-2.4 — Checkout-Submit-Button bleibt grau ohne Erklärung
- **Was erlebt der User:** Tippt Mail ein, vergisst eine Checkbox, klickt — es
  passiert nichts (Button ist disabled). Was fehlt? Welche Pflicht?
- **Was sollte er erleben:** Inline-Hint unter dem Button "Bitte zustimmen:
  Allgemeine Geschäftsbedingungen" oder "E-Mail-Adresse vervollständigen".
- **Fix:** `checkout-form.tsx` rendert eine Liste fehlender Pflichten direkt
  über/unter dem Button mit `aria-live="polite"`.
- **Severity:** P2.

### F-2.5 — `/products` Empty-State hat zwei verschiedene Pfade
- **Was erlebt der User:** Bei leerer DB-Liste sieht er "Bitte kontaktieren
  Sie den Administrator" (Sie-Form, sonst überall Du-Form). Bei No-Result-Suche
  sieht er anderen Block weiter unten — aber der frühe `return` triggert nie
  in der Realität (Stock-Filter sorgt dafür).
- **Was sollte er erleben:** Konsistente Du-Form, ein einziger Empty-State.
- **Fix:** Wording "Du" + frühen Empty-Return entfernen (bleibt der spezifischere
  No-Result-Block).
- **Severity:** P2 (Konsistenz + falsche Anrede).

### F-2.6 — 404-Seite hat keine Recovery-Option außer "Zum Shop"
- **Was erlebt der User:** Hat z.B. eine alte URL `/products/NORTON-OLD-SKU`
  geklickt. 404 → "Zum Shop" oder "Zur Startseite" — er muss die Suche selbst
  finden.
- **Was sollte er erleben:** Auf der 404-Seite ein Suchfeld direkt einbauen.
- **Fix:** `app/not-found.tsx` enthält `/products` Search-Box.
- **Severity:** P2.

### F-2.7 — `[Email Mock]` Konsole-Log statt echter Mail bei `EMAIL_MOCK=true`
- **Was erlebt der User:** Nichts — Mail kommt nicht an. Aber: User merkt das
  ggf. nicht, glaubt sie sei im Spam, kontaktiert Support nach 24h.
- **Was sollte er erleben:** In Production darf `EMAIL_MOCK=true` nicht
  versehentlich aktiv sein.
- **Fix:** Boot-Time-Check der die Variable in production (NODE_ENV=production)
  laut warnt + Order-Detail zeigt "Mail noch nicht versendet".
- **Severity:** P2 (Operations-Risiko, wirkt sich aber unmittelbar auf User aus).

---

## 🟡 P3 — Feedback / Loading / Konsistenz

### F-3.1 — Search-Bar hat keinen Pending/Loading-Indikator
- **Was erlebt der User:** Tippt "Norton", wartet 300ms (Debounce), Liste
  aktualisiert sich — aber während der Wartezeit kein Hinweis. Wenn das Netzwerk
  langsam ist, scheint die Suche kaputt.
- **Fix:** Lupe-Icon dreht/dimmt während router-pending. Mit `useTransition` aus
  React 19.
- **Severity:** P3.

### F-3.2 — Category-Filter Klick → kompletter SSR-Reload ohne visuelles Feedback
- **Was erlebt der User:** Klickt "Antivirus", auf langsamem Netz wird die Liste
  erst nach 2s neu gerendert. In der Zeit denkt er, der Klick ist verloren.
- **Fix:** `useTransition` in `category-filter.tsx`, Pillen mit
  `aria-busy={isPending}` + leichtem Pulse.
- **Severity:** P3.

### F-3.3 — Mobile-Nav: Kein Focus-Trap, kein Outside-Click-Close
- **Was erlebt der User:** Öffnet Burger-Menu, tippt außerhalb auf den Hintergrund
  — Menu bleibt offen. Tab-Navigation springt aus dem Menu raus, ohne Schließen.
- **Fix:** Outside-Click-Listener + ESC ist schon da, fehlt: Focus auf erste
  Link-Element beim Öffnen, Focus-Return auf Burger beim Schließen.
- **Severity:** P3.

### F-3.4 — Footer-Logo unterscheidet sich vom Header-Logo
- **Was erlebt der User:** Header hat schickes `<Logo size="md">` (Component),
  Footer hat hardcoded Span-Text mit `opacity-60`. Optisch zwei verschiedene Marken.
- **Fix:** `<Logo size="md" variant="light">` im Footer.
- **Severity:** P3 (visuell). Ich verschiebe das auf später — Logo-Component
  hat noch keine "light"-Variante.

### F-3.5 — "Nur noch X×" Stock-Warning ist nur farblich (rot) markiert
- **Was erlebt der User mit Farbblindheit:** sieht keine Dringlichkeit.
- **Fix:** `⚠️` Icon als zusätzliche Verstärkung.
- **Severity:** P4 — verschoben.

---

## 🔵 P4 — A11y / Polish

### F-4.1 — Skip-Link existiert, aber `<main>` ist in der Shop-Layout-Group, das ist OK
- ✅ kein Fix nötig.

### F-4.2 — Search-Bar nur mit `aria-label`, kein sichtbares Label
- Akzeptabel (Placeholder + Lupe-Icon), aber WCAG-2.1 SC 2.4.6 will sichtbares
  Label. Da es Konvention ist, lassen wir es.
- **Severity:** P4 — ignoriert.

### F-4.3 — `useCallback` in search-bar.tsx importiert aber unbenutzt
- Dead Import, kein User-Impact, fix beim Editieren.

### F-4.4 — `customer_creation` nicht gesetzt → manche EU-Stripe-Konfigs scheitern bei `billing_address_collection: "required"`
- **Was erlebt der User:** Sieht "Address collection failed" auf Stripe-Page.
  Sehr selten (nur bestimmte Account-Settings), nicht bestätigt.
- **Fix:** Optional, nicht jetzt.
- **Severity:** P4 — nicht aktuell behoben.

### F-4.5 — Cookie-Banner-Accept hat keinen Toast → User klickt 2× weil unsicher
- **Severity:** P4 — verschoben.

---

## Priorisierte Fix-Liste (heute umgesetzt)

| # | ID | Severity | Wirkung |
|---|----|----------|---------|
| 1 | F-1.1 | 🔴 P1 | Bestellstatus-Page + Email-Link auf existierenden Pfad |
| 2 | F-1.2 | 🔴 P1 | Resend-Mail-Endpoint + Button |
| 3 | F-1.3 | 🔴 P1 | Session-ID im Pending-Timeout zum Kopieren |
| 4 | F-2.1 | 🟠 P2 | Error-IDs in /api/checkout |
| 5 | F-2.2 | 🟠 P2 | Error-Boundary mit digest + Mailto |
| 6 | F-2.3 | 🟠 P2 | /checkout/success ohne session_id: hilfreicher Empty |
| 7 | F-2.4 | 🟠 P2 | Inline-Hints am disabled Submit-Button |
| 8 | F-2.5 | 🟠 P2 | "Sie"→"Du" Empty-State, Empty-Pfade konsolidiert |
| 9 | F-2.6 | 🟠 P2 | 404-Seite mit Search-Field |
| 10 | F-3.1 | 🟡 P3 | Search-Bar Pending-Indikator (useTransition) |
| 11 | F-3.2 | 🟡 P3 | Category-Filter Pending-State |
| 12 | F-3.3 | 🟡 P3 | Mobile-Nav Outside-Click + Focus-Mgmt |

## Bewusst ausgeklammert

- **MemPalace-Integration** — passt nicht zur Architektur (separater Chat).
- **F-2.7 EMAIL_MOCK Production-Check** — heute irrelevant, weil EMAIL_MOCK=false
  läuft. Notiert im Operations-Backlog.
- **F-3.4 Logo-Variante** — kosmetisch, braucht Designer.
- **Pricing-Vertrauen / "Echtheit der Keys"** — strategisch, nicht UX.
- **Performance /products 779KB** — separates Thema (Image-Pagination), heute kein
  blocker (lädt unter 2s mit Cache).

## Methode

- 1of10.de live geöffnet, alle 5 Hauptpfade durchgespielt:
  Home → Listing → PDP → Checkout → Confirm.
- Repo-Lesung der relevanten 12 Dateien (App-Layout, PDP, Listing, Checkout-Form,
  Success, Pending, Email-Template, Error-Boundary, NotFound, Mobile-Nav,
  Search-Bar, Filter).
- Entwickler-Konsole nicht geöffnet — Audit ist 100% User-Sicht.
