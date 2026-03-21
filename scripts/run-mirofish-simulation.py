#!/usr/bin/env python3
"""
MiroFish Simulation Runner für 1of10.de
Füttert MiroFish mit Produktdaten und simuliert 5 Geschäftsszenarien.

Nutzung:
    python scripts/run-mirofish-simulation.py

Voraussetzung: MiroFish läuft auf http://localhost:5001
"""

import os
import sys
import time
import json
import tempfile
import logging
from pathlib import Path
from datetime import datetime

import requests

# ---------------------------------------------------------------------------
# Konfiguration
# ---------------------------------------------------------------------------

MIROFISH_BASE = os.getenv("MIROFISH_API_URL", "http://localhost:5001")
POLL_INTERVAL = 5          # Sekunden zwischen Polling-Versuchen
TASK_TIMEOUT = 300         # Max. 5 Minuten pro async Task
REQUEST_TIMEOUT = 60       # Timeout für synchrone HTTP-Requests
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "apps" / "web" / "content" / "simulations"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("mirofish-runner")

# ---------------------------------------------------------------------------
# Seed-Dokument
# ---------------------------------------------------------------------------

SEED_TEXT = """\
1of10.de — Software-Lizenz-Shop mit Gamified Refund

GESCHÄFTSMODELL:
- Jeder 10. Kauf wird auf Kulanz erstattet (ShuffleBag-Mechanik)
- Keine Lotterie, kein Gewinnspiel — freiwillige Kulanzleistung
- Zielgruppe: Tech-affine Deutsche, 25-45 Jahre

PRODUKTKATALOG:
| SKU | Produkt | Einkaufspreis | Verkaufspreis | Marge | Lagerbestand |
|-----|---------|---------------|---------------|-------|--------------|
| WIN-11-PRO | Microsoft Windows 11 Professional | 8,50€ | 14,99€ | 43% | 100 |
| WIN-11-HOME | Microsoft Windows 11 Home | 6,50€ | 11,99€ | 46% | 80 |
| MS-365-BUS-STD | Microsoft 365 Business Standard | 10,20€ | 12,90€ | 21% | 50 |
| MS-365-BUS-PREM | Microsoft 365 Business Premium | 18,00€ | 22,00€ | 18% | 30 |
| MS-OFFICE-2024-PRO | Microsoft Office 2024 Professional Plus | 22,00€ | 29,99€ | 27% | 45 |
| ADOBE-CC-ALL | Adobe Creative Cloud All Apps (1 Jahr) | 45,00€ | 54,99€ | 18% | 25 |
| NORTON-360-DLX | Norton 360 Deluxe Antivirus (1 Jahr) | 8,00€ | 14,99€ | 47% | 60 |
| KASPERSKY-PLUS | Kaspersky Plus Antivirus (1 Jahr) | 7,50€ | 12,99€ | 42% | 55 |
| WIN-SRV-2022-STD | Windows Server 2022 Standard | 120,00€ | 179,99€ | 33% | 15 |

STRIPE-GEBÜHREN: 1,5% + 0,25€ pro Transaktion
ERSTATTUNGSRATE: 10% (exakt jeder 10. Kauf)
HOSTING-KOSTEN: ~4€/Monat (Vercel kostenlos, Neon kostenlos, Hetzner 3,79€)
BETREIBER: Einzelunternehmer, Kleinunternehmer §19 UStG (keine MwSt)

WETTBEWERB:
- Günstige Key-Shops (MMOGA, Kinguin, G2A, SCDKey)
- Direkt vom Hersteller (Microsoft Store, Adobe Store)
- 1of10 Differenzierung: Gamified Refund, Transparenz, deutsche Firma
"""

# ---------------------------------------------------------------------------
# Szenarien
# ---------------------------------------------------------------------------

SCENARIOS: list[dict[str, str]] = [
    {
        "name": "Preisstrategie",
        "slug": "01-preisstrategie",
        "requirement": (
            "Wie reagieren 100 deutsche Tech-Käufer (25-45 Jahre) auf die aktuellen "
            "Preise von 1of10.de? Welche Produkte haben das höchste Kaufinteresse? "
            "Welche Preise sind zu hoch, welche könnten erhöht werden?"
        ),
    },
    {
        "name": "Erstattungsmechanik",
        "slug": "02-erstattungsmechanik",
        "requirement": (
            "Wie beeinflusst die 10%-Kaufpreiserstattung die Kaufentscheidung? "
            "Ist 10% die optimale Rate oder wäre 15% oder 5% effektiver für "
            "Umsatz und Kundenwachstum?"
        ),
    },
    {
        "name": "Vertrauen und Skepsis",
        "slug": "03-vertrauen-skepsis",
        "requirement": (
            "Wie reagieren verschiedene Kundentypen (Schnäppchenjäger, Skeptiker, "
            "Tech-Enthusiasten) auf das 1of10-Konzept? Was sind die häufigsten "
            "Einwände und wie können sie adressiert werden?"
        ),
    },
    {
        "name": "Wettbewerbsreaktion",
        "slug": "04-wettbewerbsreaktion",
        "requirement": (
            "Wie verhalten sich 1of10-Kunden wenn sie erfahren, dass sie die "
            "gleichen Produkte bei MMOGA oder Kinguin günstiger bekommen könnten? "
            "Was hält sie bei 1of10?"
        ),
    },
    {
        "name": "Viralität",
        "slug": "05-viralitaet",
        "requirement": (
            "Wenn ein Kunde bei 1of10 gewinnt (Kaufpreis erstattet), wie "
            "wahrscheinlich teilt er das Erlebnis auf Social Media? Welche "
            "Plattform (WhatsApp, Instagram, Reddit, LinkedIn) wird am häufigsten "
            "genutzt? Was löst den Share-Impuls aus?"
        ),
    },
]

# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------


def api(method: str, path: str, **kwargs) -> requests.Response:
    """Sendet einen HTTP-Request an die MiroFish API."""
    url = f"{MIROFISH_BASE}{path}"
    kwargs.setdefault("timeout", REQUEST_TIMEOUT)
    resp = getattr(requests, method)(url, **kwargs)
    if not resp.ok:
        log.error("API %s %s → %s: %s", method.upper(), path, resp.status_code, resp.text[:500])
    resp.raise_for_status()
    return resp


def poll_task(task_id: str, label: str = "Task") -> dict:
    """Pollt einen async Task bis completed/failed oder Timeout."""
    deadline = time.time() + TASK_TIMEOUT
    while time.time() < deadline:
        resp = api("get", f"/api/graph/task/{task_id}")
        data = resp.json().get("data", {})
        status = data.get("status", "unknown")
        progress = data.get("progress", 0)
        message = data.get("message", "")
        log.info("  [%s] Status: %s (%d%%) — %s", label, status, progress, message)
        if status == "completed":
            return data
        if status == "failed":
            raise RuntimeError(f"{label} fehlgeschlagen: {data.get('error', message)}")
        time.sleep(POLL_INTERVAL)
    raise TimeoutError(f"{label} hat nach {TASK_TIMEOUT}s nicht abgeschlossen")


def poll_simulation_run(simulation_id: str) -> dict:
    """Pollt den Simulation-Runner bis completed/stopped/failed."""
    deadline = time.time() + TASK_TIMEOUT
    while time.time() < deadline:
        resp = api("get", f"/api/simulation/{simulation_id}/run-status")
        data = resp.json().get("data", {})
        status = data.get("runner_status", "unknown")
        current = data.get("current_round", 0)
        total = data.get("total_rounds", "?")
        pct = data.get("progress_percent", 0)
        log.info("  [Simulation] %s — Runde %s/%s (%.1f%%)", status, current, total, pct)
        if status in ("completed", "stopped"):
            return data
        if status == "failed":
            raise RuntimeError(f"Simulation fehlgeschlagen: {data}")
        time.sleep(POLL_INTERVAL)
    raise TimeoutError(f"Simulation hat nach {TASK_TIMEOUT}s nicht abgeschlossen")


def poll_report_task(task_id: str, simulation_id: str) -> dict:
    """Pollt den Report-Generierungs-Task."""
    deadline = time.time() + TASK_TIMEOUT
    while time.time() < deadline:
        resp = api("post", "/api/report/generate/status", json={
            "task_id": task_id,
            "simulation_id": simulation_id,
        })
        data = resp.json().get("data", {})
        status = data.get("status", "unknown")
        progress = data.get("progress", 0)
        message = data.get("message", "")
        log.info("  [Report] Status: %s (%d%%) — %s", status, progress, message)
        if status == "completed":
            return data
        if status == "failed":
            raise RuntimeError(f"Report-Generierung fehlgeschlagen: {data.get('error', message)}")
        time.sleep(POLL_INTERVAL)
    raise TimeoutError(f"Report-Generierung hat nach {TASK_TIMEOUT}s nicht abgeschlossen")


def save_report_markdown(slug: str, name: str, markdown_content: str) -> Path:
    """Speichert den Report als Markdown-Datei."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d")
    filepath = OUTPUT_DIR / f"{slug}-{ts}.md"
    header = (
        f"---\n"
        f"title: \"MiroFish Simulation — {name}\"\n"
        f"date: \"{ts}\"\n"
        f"scenario: \"{slug}\"\n"
        f"generator: \"MiroFish Swarm Intelligence Engine\"\n"
        f"---\n\n"
    )
    filepath.write_text(header + markdown_content, encoding="utf-8")
    log.info("  Report gespeichert: %s", filepath)
    return filepath


# ---------------------------------------------------------------------------
# Szenario-Pipeline
# ---------------------------------------------------------------------------


def run_scenario(scenario: dict, index: int) -> dict:
    """Führt die komplette Pipeline für ein einzelnes Szenario aus.

    1. Ontology generieren (File-Upload)
    2. Graph bauen (async)
    3. Simulation erstellen
    4. Simulation vorbereiten (async)
    5. Simulation starten & warten
    6. Report generieren (async)
    7. Report abrufen & speichern
    """
    name = scenario["name"]
    slug = scenario["slug"]
    requirement = scenario["requirement"]

    log.info("=" * 70)
    log.info("SZENARIO %d/5: %s", index, name)
    log.info("=" * 70)

    # --- 1. Ontology ---
    log.info("Schritt 1/7: Ontology generieren …")
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".txt", prefix="1of10-seed-", delete=False, encoding="utf-8"
    ) as tmp:
        tmp.write(SEED_TEXT)
        seed_path = tmp.name

    try:
        with open(seed_path, "rb") as f:
            resp = api(
                "post",
                "/api/graph/ontology/generate",
                files={"files": ("1of10-produktdaten.txt", f, "text/plain")},
                data={
                    "simulation_requirement": requirement,
                    "project_name": f"1of10 — {name}",
                    "additional_context": (
                        "Deutscher Software-Lizenz-Shop. "
                        "Simuliere deutsche Kundensegmente. "
                        "Antworte auf Deutsch."
                    ),
                },
                timeout=120,
            )
    finally:
        os.unlink(seed_path)

    ontology_data = resp.json()
    if not ontology_data.get("success"):
        raise RuntimeError(f"Ontology-Fehler: {ontology_data.get('error')}")

    project_id = ontology_data["data"]["project_id"]
    entity_count = len(ontology_data["data"].get("ontology", {}).get("entity_types", []))
    edge_count = len(ontology_data["data"].get("ontology", {}).get("edge_types", []))
    log.info("  Projekt: %s — %d Entities, %d Edges", project_id, entity_count, edge_count)

    # --- 2. Graph bauen ---
    log.info("Schritt 2/7: Knowledge-Graph bauen …")
    resp = api("post", "/api/graph/build", json={"project_id": project_id})
    build_data = resp.json()
    if not build_data.get("success"):
        raise RuntimeError(f"Graph-Build-Fehler: {build_data.get('error')}")

    task_id = build_data["data"]["task_id"]
    log.info("  Task: %s", task_id)
    task_result = poll_task(task_id, "Graph-Build")
    graph_id = task_result.get("result", {}).get("graph_id", "")
    log.info("  Graph-ID: %s", graph_id)

    # --- 3. Simulation erstellen ---
    log.info("Schritt 3/7: Simulation erstellen …")
    resp = api("post", "/api/simulation/create", json={
        "project_id": project_id,
        "graph_id": graph_id,
        "enable_twitter": True,
        "enable_reddit": True,
    })
    sim_data = resp.json()
    if not sim_data.get("success"):
        raise RuntimeError(f"Simulation-Create-Fehler: {sim_data.get('error')}")

    simulation_id = sim_data["data"]["simulation_id"]
    log.info("  Simulation-ID: %s", simulation_id)

    # --- 4. Simulation vorbereiten ---
    log.info("Schritt 4/7: Simulation vorbereiten …")
    resp = api("post", "/api/simulation/prepare", json={
        "simulation_id": simulation_id,
        "use_llm_for_profiles": True,
    })
    prep_data = resp.json()
    if not prep_data.get("success"):
        raise RuntimeError(f"Prepare-Fehler: {prep_data.get('error')}")

    if prep_data["data"].get("already_prepared"):
        log.info("  Bereits vorbereitet — überspringe Polling")
    else:
        prep_task_id = prep_data["data"].get("task_id")
        if prep_task_id:
            poll_task(prep_task_id, "Prepare")

    # --- 5. Simulation starten ---
    log.info("Schritt 5/7: Simulation starten …")
    resp = api("post", "/api/simulation/start", json={
        "simulation_id": simulation_id,
        "platform": "parallel",
    })
    start_data = resp.json()
    if not start_data.get("success"):
        raise RuntimeError(f"Start-Fehler: {start_data.get('error')}")

    log.info("  Läuft … warte auf Abschluss")
    poll_simulation_run(simulation_id)

    # --- 6. Report generieren ---
    log.info("Schritt 6/7: Report generieren …")
    resp = api("post", "/api/report/generate", json={
        "simulation_id": simulation_id,
    })
    report_gen = resp.json()
    if not report_gen.get("success"):
        raise RuntimeError(f"Report-Generate-Fehler: {report_gen.get('error')}")

    report_id = report_gen["data"].get("report_id")
    if report_gen["data"].get("already_generated"):
        log.info("  Report existiert bereits: %s", report_id)
    else:
        report_task_id = report_gen["data"].get("task_id")
        if report_task_id:
            poll_report_task(report_task_id, simulation_id)

    # --- 7. Report abrufen ---
    log.info("Schritt 7/7: Report abrufen …")
    resp = api("get", f"/api/report/{report_id}")
    report_data = resp.json()
    if not report_data.get("success"):
        raise RuntimeError(f"Report-Get-Fehler: {report_data.get('error')}")

    markdown = report_data["data"].get("markdown_content", "")
    if not markdown:
        markdown = json.dumps(report_data["data"], indent=2, ensure_ascii=False)

    filepath = save_report_markdown(slug, name, markdown)

    return {
        "scenario": name,
        "slug": slug,
        "project_id": project_id,
        "graph_id": graph_id,
        "simulation_id": simulation_id,
        "report_id": report_id,
        "report_file": str(filepath),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def check_mirofish_available():
    """Prüft ob MiroFish erreichbar ist."""
    try:
        resp = requests.get(f"{MIROFISH_BASE}/health", timeout=10)
        if resp.ok:
            log.info("MiroFish erreichbar auf %s", MIROFISH_BASE)
            return True
    except requests.ConnectionError:
        pass
    log.error("MiroFish nicht erreichbar auf %s", MIROFISH_BASE)
    log.error("Bitte starten: cd services/mirofish && docker compose up -d")
    return False


def main():
    log.info("=" * 70)
    log.info("1of10 × MiroFish Simulation Runner")
    log.info("Datum: %s", datetime.now().strftime("%Y-%m-%d %H:%M"))
    log.info("API:   %s", MIROFISH_BASE)
    log.info("=" * 70)

    if not check_mirofish_available():
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    results: list[dict] = []
    errors: list[dict] = []
    start_time = time.time()

    for i, scenario in enumerate(SCENARIOS, 1):
        scenario_start = time.time()
        try:
            result = run_scenario(scenario, i)
            results.append(result)
            elapsed = time.time() - scenario_start
            log.info("✓ Szenario %d/5 abgeschlossen in %.0fs", i, elapsed)
        except Exception as exc:
            elapsed = time.time() - scenario_start
            log.error("✗ Szenario %d/5 fehlgeschlagen nach %.0fs: %s", i, elapsed, exc)
            errors.append({"scenario": scenario["name"], "error": str(exc)})

    # --- Zusammenfassung ---
    total_elapsed = time.time() - start_time
    log.info("")
    log.info("=" * 70)
    log.info("ZUSAMMENFASSUNG")
    log.info("=" * 70)
    log.info("Erfolgreich: %d/5", len(results))
    log.info("Fehlgeschlagen: %d/5", len(errors))
    log.info("Gesamtdauer: %.0fs", total_elapsed)
    log.info("")

    for r in results:
        log.info("  ✓ %s", r["scenario"])
        log.info("    Report: %s", r["report_file"])

    for e in errors:
        log.info("  ✗ %s — %s", e["scenario"], e["error"])

    # Zusammenfassungs-Datei schreiben
    summary_path = OUTPUT_DIR / "SUMMARY.md"
    lines = [
        "# MiroFish Simulationen — Zusammenfassung\n\n",
        f"**Datum:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n",
        f"**Erfolgreich:** {len(results)}/5\n",
        f"**Fehlgeschlagen:** {len(errors)}/5\n",
        f"**Gesamtdauer:** {total_elapsed:.0f}s\n\n",
        "## Ergebnisse\n\n",
    ]
    for r in results:
        report_name = Path(r["report_file"]).name
        lines.append(f"- [{r['scenario']}](./{report_name})\n")
    if errors:
        lines.append("\n## Fehler\n\n")
        for e in errors:
            lines.append(f"- **{e['scenario']}:** {e['error']}\n")
    summary_path.write_text("".join(lines), encoding="utf-8")
    log.info("\nZusammenfassung: %s", summary_path)

    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
