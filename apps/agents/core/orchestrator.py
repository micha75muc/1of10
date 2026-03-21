"""
Michael — Orchestrator Agent.
LangGraph StateGraph that routes user prompts to specialized sub-agents.
"""

import logging

from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END

from core.state import AgentState
from domains.procurement import node_procurement
from domains.finance import node_finance
from domains.marketing import node_marketing_sales
from domains.it_ops import node_it_ops
from domains.compliance import node_compliance
from domains.simulation import node_simulation

logger = logging.getLogger(__name__)

# Keywords for routing (MVP — replace with LLM classification when API key available)
ROUTING_KEYWORDS: dict[str, list[str]] = {
    "procurement": [
        "preis", "price", "distributor", "einkauf", "beschaffung",
        "lieferant", "sku", "marge", "margin", "nestor", "lager", "stock",
    ],
    "finance": [
        "finan", "umsatz", "revenue", "report", "bericht", "gebühr",
        "fee", "stripe", "profit", "elena", "kosten",
    ],
    "marketing_sales": [
        "marketing", "content", "kampagne", "campaign", "newsletter",
        "social", "gewinner", "winner", "inge", "werbung",
        "vertrieb", "sales", "outreach", "partner", "youtube",
        "influencer", "email", "akquise",
    ],
    "it_ops": [
        "support", "ticket", "problem", "fehler", "error", "bug",
        "system", "martin", "it", "ops", "knowledge",
    ],
    "compliance": [
        "compliance", "dsgvo", "gdpr", "bgb", "widerruf", "recht",
        "legal", "denny", "amoe", "prüf", "audit", "datenschutz",
    ],
    "simulation": [
        "simulation", "vorhersage", "prognose", "kundenreaktion",
        "predict", "forecast", "mirofish", "mira", "simulier",
    ],
}


def classify_prompt(prompt: str) -> str:
    """Classify user prompt to determine target agent (keyword-based MVP)."""
    prompt_lower = prompt.lower().strip()

    if not prompt_lower:
        logger.warning("Empty prompt received — routing to default")
        return "orchestrator"

    scores: dict[str, int] = {}
    for agent, keywords in ROUTING_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in prompt_lower)
        if score > 0:
            scores[agent] = score

    if not scores:
        logger.info("No keyword match for prompt — routing to default")
        return "orchestrator"  # Default: Michael handles it

    target = max(scores, key=scores.get)  # type: ignore[arg-type]
    logger.info("Routed to '%s' (score: %d)", target, scores[target])
    return target


async def node_orchestrator(state: AgentState) -> AgentState:
    """Michael classifies the prompt and sets the routing target."""
    last_message = state["messages"][-1].content if state["messages"] else ""
    target = classify_prompt(str(last_message))

    return {
        **state,
        "target_agent": target,
    }


async def node_default_response(state: AgentState) -> AgentState:
    """Michael handles queries that don't match any specific agent."""
    last_message = state["messages"][-1].content if state["messages"] else ""

    response = (
        f"[Michael/Orchestrator] Ich konnte deine Anfrage keinem spezifischen "
        f"Agenten zuordnen. Verfügbare Agenten:\n\n"
        f"- **Nestor** (Beschaffung): Preise, Lieferanten, Lager\n"
        f"- **Elena** (Finanzen): Reports, Umsatz, Stripe-Gebühren\n"
        f"- **Inge** (Marketing & Vertrieb): Content, Kampagnen, Outreach, Partner\n"
        f"- **Martin** (IT-Ops): Support, Tickets, Knowledge Base\n"
        f"- **Denny** (Compliance): DSGVO, BGB, Dokumentenprüfung\n"
        f"- **Mira** (Simulation): Kundenverhalten, Vorhersagen, Prognosen\n\n"
        f"Bitte formuliere deine Anfrage spezifischer."
    )

    return {
        **state,
        "messages": [*state["messages"], AIMessage(content=response)],
        "agent_response": response,
        "agent_used": "Michael",
    }


def route_to_agent(state: AgentState) -> str:
    """Conditional edge: routes to the target agent node."""
    target = state.get("target_agent", "orchestrator")
    if target in (
        "procurement", "finance", "marketing_sales",
        "it_ops", "compliance", "simulation",
    ):
        return target
    return "default"


# Build the LangGraph StateGraph
graph_builder = StateGraph(AgentState)

# Add nodes
graph_builder.add_node("orchestrator", node_orchestrator)
graph_builder.add_node("procurement", node_procurement)
graph_builder.add_node("finance", node_finance)
graph_builder.add_node("marketing_sales", node_marketing_sales)
graph_builder.add_node("it_ops", node_it_ops)
graph_builder.add_node("compliance", node_compliance)
graph_builder.add_node("simulation", node_simulation)
graph_builder.add_node("default", node_default_response)

# Define edges
graph_builder.add_edge(START, "orchestrator")
graph_builder.add_conditional_edges(
    "orchestrator",
    route_to_agent,
    {
        "procurement": "procurement",
        "finance": "finance",
        "marketing_sales": "marketing_sales",
        "it_ops": "it_ops",
        "compliance": "compliance",
        "simulation": "simulation",
        "default": "default",
    },
)

# All agents end after processing
for node in ["procurement", "finance", "marketing_sales", "it_ops", "compliance", "simulation", "default"]:
    graph_builder.add_edge(node, END)

# Compile
orchestrator_graph = graph_builder.compile()


async def run_orchestrator(prompt: str, context: dict | None = None) -> dict:
    """Run the orchestrator graph with a user prompt."""
    if not prompt or not prompt.strip():
        logger.warning("Empty prompt submitted to orchestrator")
        return {
            "response": "Bitte gib eine Anfrage ein.",
            "agent_used": "Michael",
            "metadata": {"error": "empty_prompt"},
        }

    logger.info("Orchestrator invoked with prompt: %s", prompt[:120])

    initial_state: AgentState = {
        "messages": [HumanMessage(content=prompt)],
        "target_agent": None,
        "agent_response": "",
        "agent_used": "",
    }

    try:
        result = await orchestrator_graph.ainvoke(initial_state)
    except Exception:
        logger.exception("Orchestrator graph execution failed")
        return {
            "response": "Ein interner Fehler ist aufgetreten. Bitte versuche es erneut.",
            "agent_used": "Michael",
            "metadata": {"error": "orchestrator_failure"},
        }

    return {
        "response": result.get("agent_response", "Keine Antwort erhalten."),
        "agent_used": result.get("agent_used", "unknown"),
        "metadata": {
            "target_agent": result.get("target_agent"),
            "context": context,
        },
    }
