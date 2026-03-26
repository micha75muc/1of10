---
description: "Deploy 1of10 to Vercel production. Runs build, tests, and deploy script."
agent: "agent"
tools: [execute, read]
---
Deploy 1of10 zu Vercel Production:

1. `cd /workspaces/1of10/apps/web && npx next build` — Build muss erfolgreich sein
2. `cd /workspaces/1of10/apps/web && npx vitest run` — Alle Tests müssen grün sein
3. `cd /workspaces/1of10 && python3 scripts/deploy-vercel.py` — Deploy zu Vercel

Berichte: Build-Status, Test-Anzahl, Deploy-URL. Bei Fehler STOPPEN.
