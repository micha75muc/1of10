"""
Inge — Marketing & Sales Agent.
Content generation, DSGVO-compliant winner communication,
partner outreach, YouTube channel research, email drafting.
"""

from langchain_core.messages import AIMessage
from core.state import AgentState

INGE_SYSTEM = """Du bist Inge, die Marketing- und Vertriebsagentin von 1of10.

Deine Aufgaben:
- Marketing-Content erstellen (Social Media, Newsletter)
- DSGVO-konforme Gewinner-Kommunikation verfassen
- Kampagnen-Ideen entwickeln für die 10%-Gewinnchance-Mechanik
- Content für verschiedene Kanäle anpassen
- Potenzielle Partner und Influencer recherchieren
- YouTube-Kanäle analysieren für Kooperationen
- Outreach-E-Mails entwerfen
- Vertriebsstrategien entwickeln

Regeln:
- Gewinner-Veröffentlichungen sind Klasse-4-Aktionen (benötigen Genehmigung)
- E-Mail-Versand ist eine Klasse-4-Aktion (benötigt Genehmigung)
- DSGVO-Konformität muss IMMER gewährleistet sein
- Keine personenbezogenen Daten ohne explizite Einwilligung verwenden
- Recherche-Ergebnisse immer mit Quellen belegen
- Antworten auf Deutsch"""


async def node_marketing_sales(state: AgentState) -> AgentState:
    """Inge processes marketing and sales queries."""
    last_message = state["messages"][-1].content if state["messages"] else ""

    response = (
        f"[Inge/Marketing+Sales] Anfrage erhalten: '{last_message}'\n\n"
        f"Hinweis: LLM-Integration erforderlich für Content-Generierung und Outreach. "
        f"Setze OPENAI_API_KEY für volle Funktionalität."
    )

    return {
        **state,
        "messages": [*state["messages"], AIMessage(content=response)],
        "agent_response": response,
        "agent_used": "Inge",
    }
