"""
Mira — Customer Simulation Agent.
Nutzt MiroFish um Kundenverhalten vorherzusagen.
"""

import logging

from tools.mirofish_client import mirofish

logger = logging.getLogger(__name__)


async def handle_simulation(prompt: str) -> str:
    """Verarbeitet Simulations-Anfragen."""

    if not await mirofish.is_available():
        return (
            "⚠️ MiroFish Simulation Engine ist nicht verfügbar.\n"
            "Bitte MIROFISH_ENABLED=true und MIROFISH_API_URL in .env setzen.\n"
            "Setup: ./scripts/setup-mirofish.sh"
        )

    prompt_lower = prompt.lower()

    if any(w in prompt_lower for w in ["preis", "price", "preisänderung"]):
        result = await mirofish.predict_pricing_impact(
            product_sku="WIN-11-PRO",
            current_price=14.99,
            new_price=17.99,
        )
    elif any(w in prompt_lower for w in ["erstattung", "refund", "rate", "quote"]):
        result = await mirofish.predict_refund_rate_impact()
    elif any(w in prompt_lower for w in ["produkt", "product", "nachfrage", "demand"]):
        result = await mirofish.predict_product_demand(
            product_name="Neues Produkt",
            price=19.99,
            category="Software",
        )
    else:
        result = await mirofish.simulate_customer_reaction(
            scenario=prompt,
            product_data={"context": "1of10.de Software-Shop"},
        )

    return format_prediction_report(result)


def format_prediction_report(result: dict) -> str:
    """Formatiere das Ergebnis als lesbaren Bericht."""
    if "error" in result:
        return f"❌ Fehler: {result['error']}"

    report = "## 🔮 Simulations-Ergebnis\n\n"
    report += f"**Simulierte Agenten:** {result.get('agents_simulated', 'N/A')}\n"
    report += f"**Konfidenz:** {result.get('confidence', 'N/A')}\n\n"

    prediction = result.get("prediction", {})
    if isinstance(prediction, str):
        report += f"### Vorhersage\n{prediction}\n\n"
    elif isinstance(prediction, dict):
        report += "### Vorhersage\n"
        for key, value in prediction.items():
            report += f"- **{key}**: {value}\n"
        report += "\n"

    recommendations = result.get("recommendations", [])
    if recommendations:
        report += "### Empfehlungen\n"
        for rec in recommendations:
            report += f"- {rec}\n"

    return report


async def node_simulation(state: dict) -> dict:
    """LangGraph-Node für Mira (Simulation)."""
    from langchain_core.messages import AIMessage

    last_message = state["messages"][-1].content if state["messages"] else ""
    response = await handle_simulation(str(last_message))

    return {
        **state,
        "messages": [*state["messages"], AIMessage(content=response)],
        "agent_response": response,
        "agent_used": "Mira",
    }
