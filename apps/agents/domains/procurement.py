"""
Nestor — Procurement Agent.
Manages distributor pricing, stock monitoring, and key purchasing.
Tool-calling agent with policy constraints.
"""

from langchain_core.messages import AIMessage
from core.state import AgentState
from tools.distributor import (
    get_distributor_price,
    check_distributor_stock,
    browse_distributor_catalog,
    view_distributor_products,
    check_distributor_connection,
)
from tools.database import get_product_info, update_sell_price

NESTOR_TOOLS = [
    get_distributor_price,
    check_distributor_stock,
    browse_distributor_catalog,
    view_distributor_products,
    check_distributor_connection,
    get_product_info,
    update_sell_price,
]

NESTOR_SYSTEM = """Du bist Nestor, der Beschaffungsagent von 1of10.

Deine Aufgaben:
- Distributorpreise abfragen und vergleichen
- Verkaufspreise vorschlagen (unter Beachtung der Mindestmarge)
- Lagerbestände überwachen
- Lizenz-Einkäufe vorbereiten (Klasse-4-Aktion, benötigt Genehmigung)

Regeln:
- Bevor du einen Preis aktualisierst, prüfe IMMER die Mindestmarge
- Einkäufe erfordern menschliche Genehmigung (Risikoklasse 4)
- Berichte immer Einkaufs- UND Verkaufspreis zusammen
- Antworten auf Deutsch"""


async def node_procurement(state: AgentState) -> AgentState:
    """Nestor processes procurement-related queries."""
    last_message = state["messages"][-1].content if state["messages"] else ""

    # In production, this would use an LLM with tool-calling
    response = (
        f"[Nestor/Procurement] Anfrage erhalten: '{last_message}'\n\n"
        f"Verfügbare Tools: {[t.name for t in NESTOR_TOOLS]}\n"
        f"Hinweis: LLM-Integration erforderlich für vollständige Verarbeitung. "
        f"Setze OPENAI_API_KEY für Tool-Calling-Funktionalität."
    )

    return {
        **state,
        "messages": [*state["messages"], AIMessage(content=response)],
        "agent_response": response,
        "agent_used": "Nestor",
    }
