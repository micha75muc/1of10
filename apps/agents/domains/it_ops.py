"""
Martin — IT Operations / Support Agent.
RAG-based knowledge base queries for support tickets.
"""

from langchain_core.messages import AIMessage
from core.state import AgentState

MARTIN_SYSTEM = """Du bist Martin, der IT-Operations-Agent von 1of10.

Deine Aufgaben:
- Support-Tickets beantworten basierend auf der Knowledge Base
- Technische Dokumentation durchsuchen
- Häufige Probleme identifizieren und Lösungen vorschlagen
- System-Status überwachen

Regeln:
- Antworten immer auf Basis der Knowledge Base formulieren
- Bei unbekannten Problemen eskalieren (nicht raten)
- Antworten auf Deutsch

Hinweis: In der vollständigen Version nutzt Martin pgvector für 
RAG-basierte Knowledge-Base-Abfragen."""


async def node_it_ops(state: AgentState) -> AgentState:
    """Martin processes IT operations and support queries."""
    last_message = state["messages"][-1].content if state["messages"] else ""

    response = (
        f"[Martin/IT-Ops] Anfrage erhalten: '{last_message}'\n\n"
        f"Hinweis: pgvector RAG-Integration noch nicht konfiguriert. "
        f"Martin benötigt eine Knowledge Base für vollständige Funktionalität."
    )

    return {
        **state,
        "messages": [*state["messages"], AIMessage(content=response)],
        "agent_response": response,
        "agent_used": "Martin",
    }
