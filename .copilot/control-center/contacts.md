# Externe Kontakte — 1of10

> Strukturiertes Archiv aller externen Ansprechpartner. Bei jeder neuen Korrespondenz hier den Eintrag updaten.

## DSD Europe (Distributor)

### Jody van Gils
- **E-Mail:** `jody@dsdeurope.nl`
- **Rolle:** API/Support-Kontakt bei DSD Europe
- **Sprache:** vermutlich NL/EN, Antworten auf Deutsch akzeptiert
- **Erste Kontakt:** ca. 2026-04-18 (Sandbox-Anfrage)
- **Status:** ✅ aktiv, sehr kooperativ

**Threads im Repo:**
- `content/email-dsd-2026-04-18-sandbox-anfrage.md` — Sandbox-Freischaltung erbeten + Cookie-Persistenz-Debug
- `content/email-dsd-2026-04-29-sandbox-bestaetigung.md` — Sandbox läuft (Certs 5368308, 5368309)
- `packages/db/scripts/backfill-dsd-mandatory-fields.mjs` (Header) — Jodys Hinweis vom 30.04. zu `mandatoryClientFields` in `view.json` §3.2
- `apps/agents/main.py` (L197, L204) — Inline-Refs zu Jodys Tipps (Cookie-Persistenz, `quickorder`-Mode)

**Offene Punkte mit Jody (Stand 2026-05-01):**
- 🔴 **IP-Whitelist für Production** — blockiert Live-Verkauf. Höchste Priorität.
  Quelle: `.copilot/changelog/iteration-{4,5,6}-*.md`
- 🟡 **Packshot-Bilder** für 6 SKUs (no-image.jpg):
  DSD300029, DSD300031, DSD310025, DSD180092, 460025, GDSA-AR
- 🟢 **Live-Account-Daten** — wir melden uns "wenn es soweit ist"

**Tonality-Hinweis:** Sehr direkt, technisch, keine Floskeln. Antworten knapp und konkret halten.

---

## Identitäten / Absender

### `info@medialess.de`
- **Verwendet für:** Geschäftsmails an Distributoren/Partner (DSD/Jody, Resend Domain-Verifikation, ggf. künftig Influencer)
- **Posteingang:** TBD — wo wird gelesen? (Outlook? Webmail?)
- **Outbound via:** Manuell + Resend für Kunden-Mails

### `mhahnel@microsoft.com`
- **Verwendet für:** Microsoft-internes (Clawpilot-Workspace-Owner)
- **Nicht** für 1of10-Geschäftskorrespondenz

---

## Vorlage für neue Kontakte

```markdown
### Vorname Nachname
- **E-Mail:** `…`
- **Rolle:** …
- **Status:** ✅ aktiv | 🟡 ruhend | 🔴 problematisch
- **Erste Kontakt:** YYYY-MM-DD
- **Threads:** content/email-*.md
- **Offene Punkte:** —
- **Tonality:** —
```
