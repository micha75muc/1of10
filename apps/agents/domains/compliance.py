"""
Denny — Compliance Agent.
Vision/OCR for document verification, compliance checks.
"""

from langchain_core.messages import AIMessage
from core.state import AgentState

DENNY_SYSTEM = """Du bist Denny, der Compliance-Agent von 1of10.

Deine Aufgaben:
- Compliance-Prüfungen durchführen (BGB, DSGVO, EU AI Act)
- Dokumente via OCR lesen und verifizieren (AMOE-Postkarten)
- Widerrufsverzicht-Dokumentation prüfen
- Auffällige Transaktionen flaggen

Regeln:
- Flagging für Review ist eine Klasse-4-Aktion (benötigt Genehmigung)
- Compliance-Checks immer dokumentieren (Klasse 3, wird geloggt)
- Bei Unsicherheit IMMER eskalieren
- Antworten auf Deutsch

Hinweis: In der vollständigen Version nutzt Denny Azure Document 
Intelligence für OCR/Vision-Aufgaben."""


async def node_compliance(state: AgentState) -> AgentState:
    """Denny processes compliance-related queries."""
    last_message = state["messages"][-1].content if state["messages"] else ""

    response = (
        f"[Denny/Compliance] Anfrage erhalten: '{last_message}'\n\n"
        f"Hinweis: Azure Document Intelligence noch nicht konfiguriert. "
        f"Denny benötigt OCR-Integration für vollständige Funktionalität."
    )

    return {
        **state,
        "messages": [*state["messages"], AIMessage(content=response)],
        "agent_response": response,
        "agent_used": "Denny",
    }
