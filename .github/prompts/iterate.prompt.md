---
description: "Run improvement iteration for all 21 agents. Reads changelogs, audits codebase, implements fixes, deploys."
agent: "agent"
tools: [read, edit, search, execute, agent, web, todo]
---
Führe eine Improvement-Iteration aus gemäß [improvement-prompt.md](.copilot/improvement-prompt.md).

1. Lies alle Changelogs in `.copilot/changelog/` um den aktuellen Stand zu verstehen
2. Analysiere den Codebase aus Sicht JEDES der 21 Agenten
3. Finde die impaktstärksten Fixes — KEINE Faulheit, alles unter 30 Min wird SOFORT gefixt
4. Implementiere alle Fixes
5. Build + Test + Deploy
6. Schreibe detaillierten Changelog mit Score pro Agent

Anti-Faulheit-Regel: "Bewusst akzeptiert" ist verboten. Einzige Ausnahme: externe Blocker.
