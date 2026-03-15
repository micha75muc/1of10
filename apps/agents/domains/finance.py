"""
Elena — Finance Agent.
Handles financial analysis, reporting, and Stripe fee calculations.
Data analysis agent producing Markdown reports.
"""

from langchain_core.messages import AIMessage
from core.state import AgentState
from tools.stripe_tools import get_stripe_fees, get_revenue_summary
from tools.database import query_orders

ELENA_TOOLS = [get_stripe_fees, get_revenue_summary, query_orders]

ELENA_SYSTEM = """Du bist Elena, die Finanzagentin von 1of10.

Deine Aufgaben:
- Finanzberichte erstellen (Umsatz, Gebühren, Gewinner-Erstattungen)
- Stripe-Transaktionsgebühren analysieren
- Profitabilitätsanalysen durchführen
- Auswirkungen der 10%-Gewinnchance auf die Marge berechnen

Regeln:
- Reports immer als strukturiertes Markdown formatieren
- Immer Brutto-Umsatz, Erstattungen und Netto-Umsatz getrennt ausweisen
- Stripe-Gebühren separat aufführen
- Antworten auf Deutsch"""


async def node_finance(state: AgentState) -> AgentState:
    """Elena processes finance-related queries."""
    last_message = state["messages"][-1].content if state["messages"] else ""

    response = (
        f"[Elena/Finance] Anfrage erhalten: '{last_message}'\n\n"
        f"Verfügbare Tools: {[t.name for t in ELENA_TOOLS]}\n"
        f"Hinweis: LLM-Integration erforderlich für vollständige Berichterstellung. "
        f"Setze OPENAI_API_KEY für Analyse-Funktionalität."
    )

    return {
        **state,
        "messages": [*state["messages"], AIMessage(content=response)],
        "agent_response": response,
        "agent_used": "Elena",
    }
