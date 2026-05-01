# Playbook: Agents starten (LangGraph + GitHub Coding Agents)

Du hast **zwei Arten** von Agents:

1. **Python/LangGraph Agents** in `apps/agents/` — Runtime-Domains (procurement, marketing, finance, …) für die Web-App
2. **GitHub Coding Agents** in `.github/agents/*.agent.md` — 21 spezialisierte Repo-Operatoren (Nestor, Bea, Felix, …)

## A) LangGraph Agents lokal starten

```powershell
cd 1of10/apps/agents
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Endpoints (siehe `apps/agents/main.py`):
- `POST /run/<domain>` — orchestriert eine Domain
- `GET /health`
- `POST /tools/dsd/<call>` — direkter DSD-Aufruf (für Debug)

Aufrufen z.B.:
```powershell
curl -X POST http://localhost:8000/run/procurement -H "Content-Type: application/json" -d '{"task":"check stock for DSD150002"}'
```

## B) GitHub Coding Agents triggern

Diese Agents (`nestor`, `michael`, etc.) laufen in der **GitHub Cloud** auf Pull-Requests / Issues, wenn sie in einem Issue/PR-Kommentar erwähnt werden:

```
@nestor please check current DSD prices for top-10 SKUs
```

Voraussetzung:
- Repo hat GitHub Copilot Coding Agents aktiviert (Settings → Copilot)
- Agent-File `.github/agents/nestor.agent.md` ist in `main` committed
- Optional: Workflow `.github/workflows/copilot-agents.yml`

### Aus Clawpilot heraus triggern

```powershell
# Issue anlegen und Agent erwähnen
gh issue create --title "Stock-Check" --body "@nestor check current DSD prices for top-10 SKUs"

# Oder Kommentar an existierendes Issue
gh issue comment 42 --body "@konrad please review the latest changes in apps/web/src/checkout"
```

## C) Michael (Orchestrator) für Aufgaben-Routing

Wenn du nicht weißt, wer zuständig ist:
```
@michael implement a 'shuffle bag' refund mechanic so the 10% promise is statistically guaranteed within 100 orders
```

Michael wählt den richtigen Spezialisten (vermutlich Bea + Felix + Daniel).

## D) Welcher Agent für was?

Siehe `.github/agents/<name>.agent.md` — `description:`-Feld erklärt Triggerbedingungen.
Schnellübersicht steht in `1of10/.copilot/control-center/README.md` und im Clawpilot-Verlauf.

## E) Lokale Smoke-Tests aus Clawpilot

Selbst ohne Node/Docker kann Clawpilot mit Python:
```powershell
cd 1of10/apps/agents
python test_dsd_connection.py    # prüft DSD-Login + Cookie-Persistenz
python ../../scripts/dsd-capture-request.py    # Request/Response-Capture für Debug an Jody
```
