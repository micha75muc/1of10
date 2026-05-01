# Playbook: E-Mail an Jody (DSD Europe) / externe Partner

## Konvention

Jede ausgehende Geschäftsmail wird **als Markdown im Repo versioniert**, bevor sie rausgeht.

**Pfad:** `content/email-<partner>-<YYYY-MM-DD>-<kurz-betreff>.md`

Beispiel: `content/email-dsd-2026-05-15-ip-whitelist.md`

## Format

```markdown
# <Kurztitel>

**An:** jody@dsdeurope.nl
**Von:** info@medialess.de
**CC:** —
**Betreff:** Re: <Subject>
**Status:** draft | sent | answered

---

Hallo Jody,

…

Beste Grüße
Michael Hahnel
1of10 / medialess
info@medialess.de
```

## Schritte

### 1. Entwurf erstellen
Clawpilot kann das direkt:
> "Schreib einen Entwurf an Jody zu Thema X — Vorlage `email-dsd-…`."

→ Ergebnis: neue `.md` in `content/`.

### 2. Review
Du liest die `.md` durch (in Clawpilot oder VS Code), passt an, gibst Feedback.

### 3. Versand

**Option A — Outlook manuell**
Copy-paste aus der `.md` in Outlook → Send. Keine Tools nötig.

**Option B — Über Clawpilot M365-Tools** *(nur wenn `info@medialess.de` ein M365-Postfach ist, das Clawpilot kennt — aktuell ist Clawpilot's Outlook-Account `mhahnel@microsoft.com`, nicht `info@medialess.de`)*
→ aktuell **nicht möglich**, ohne M365-Setup für medialess.de zu erweitern.

**Option C — `gh` als Trigger** für CI-Mail
*(Overkill für einzelne Mails)*

### 4. Archivieren
Nach Versand: `Status: draft` → `sent`. Wenn Antwort kommt: Antwort als zweiten Block in dieselbe Datei oder als Reply-Datei daneben.

### 5. Eintrag in `contacts.md` updaten
"Offene Punkte" anpassen, falls sich was geändert hat.

## Sprache & Ton (Jody-spezifisch)

Aus den bisherigen Mails:
- **Direkt**, technisch, keine Werbe-Floskeln
- Konkrete Liste-Form ("• Punkt A • Punkt B"), wenn mehrere Themen
- Deutsch oder Englisch — beide ok, Deutsch tendenziell wenn von dir initiiert
- Keine Smileys
- Datum-Referenzen explizit ("am 18.04.")

## Häufige Themen

| Thema | Stand-Vorlage |
|---|---|
| IP-Whitelist Production | `content/email-dsd-2026-04-18-sandbox-anfrage.md` (Tonality) |
| Sandbox-Bestätigung | `content/email-dsd-2026-04-29-sandbox-bestaetigung.md` |
| Packshot-Bitte | siehe Liste in obigen Mails |
| Mandatory-Fields | erledigt 2026-04-30 |
