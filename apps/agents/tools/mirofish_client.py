"""
MiroFish Customer Simulation Engine — API Client.
Kommuniziert mit der MiroFish REST-API zur Vorhersage von Kundenverhalten.
MiroFish ist OPTIONAL — wenn nicht konfiguriert, gibt der Client hilfreiche Fehlermeldungen.
"""

import os
import logging

import httpx

logger = logging.getLogger(__name__)

MIROFISH_API_URL = os.getenv("MIROFISH_API_URL", "http://localhost:5001")
MIROFISH_ENABLED = os.getenv("MIROFISH_ENABLED", "false").lower() == "true"


class MiroFishClient:
    """Client für die MiroFish Customer Simulation Engine."""

    def __init__(self):
        self.base_url = MIROFISH_API_URL
        self.enabled = MIROFISH_ENABLED

    async def is_available(self) -> bool:
        """Prüft ob MiroFish erreichbar ist."""
        if not self.enabled:
            return False
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/health")
                return resp.status_code == 200
        except Exception:
            logger.warning("MiroFish nicht erreichbar unter %s", self.base_url)
            return False

    async def simulate_customer_reaction(
        self,
        scenario: str,
        product_data: dict,
        customer_segments: list[str] | None = None,
        num_agents: int = 100,
    ) -> dict:
        """Simuliere wie Kunden auf ein Szenario reagieren.

        Args:
            scenario: Beschreibung des Szenarios (z.B. "Preiserhöhung um 20%")
            product_data: Produktdaten (Name, Preis, Kategorie)
            customer_segments: Zielgruppen (z.B. ["tech-savvy", "price-sensitive"])
            num_agents: Anzahl simulierter Kunden (default: 100)

        Returns:
            dict mit Vorhersage-Ergebnis
        """
        if not self.enabled:
            return {"error": "MiroFish ist nicht aktiviert", "enabled": False}

        payload = {
            "seed_data": self._build_seed_data(product_data),
            "prediction_prompt": scenario,
            "agent_count": num_agents,
            "segments": customer_segments or ["general"],
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/simulate",
                json=payload,
            )
            resp.raise_for_status()
            result = resp.json()

        return self._parse_prediction(result)

    async def predict_pricing_impact(
        self,
        product_sku: str,
        current_price: float,
        new_price: float,
        market_context: str = "",
    ) -> dict:
        """Vorhersage der Auswirkung einer Preisänderung."""
        change_pct = (new_price - current_price) / current_price * 100
        scenario = (
            f"Online-Shop 1of10.de verkauft Software-Lizenzen.\n"
            f"USP: Jeder 10. Kauf wird auf Kulanz erstattet.\n"
            f"Produkt: {product_sku}\n"
            f"Aktueller Preis: {current_price}€\n"
            f"Neuer Preis: {new_price}€\n"
            f"Preisänderung: {change_pct:.1f}%\n"
            f"{market_context}\n\n"
            f"Frage: Wie reagieren Kunden auf diese Preisänderung?\n"
            f"Berücksichtige: Kaufbereitschaft, Preissensitivität, "
            f"Einfluss der 10%-Erstattungschance auf die Kaufentscheidung."
        )
        return await self.simulate_customer_reaction(
            scenario=scenario,
            product_data={"sku": product_sku, "price": new_price},
        )

    async def predict_refund_rate_impact(
        self,
        current_rate: float = 0.10,
        new_rate: float = 0.10,
    ) -> dict:
        """Vorhersage: Was passiert wenn wir die Erstattungsrate ändern?"""
        scenario = (
            f"Online-Shop 1of10.de erstattet aktuell {current_rate * 100:.0f}% der Käufe.\n"
            f"Geplante Änderung: {new_rate * 100:.0f}% Erstattungsrate.\n\n"
            f"Frage: Wie beeinflusst diese Änderung:\n"
            f"- Kaufbereitschaft neuer Kunden\n"
            f"- Wiederkaufrate bestehender Kunden\n"
            f"- Virale Weiterempfehlung (Share-Rate)\n"
            f"- Vertrauen und Markenwahrnehmung"
        )
        return await self.simulate_customer_reaction(
            scenario=scenario,
            product_data={"rate": new_rate},
        )

    async def predict_product_demand(
        self,
        product_name: str,
        price: float,
        category: str,
    ) -> dict:
        """Vorhersage der Nachfrage für ein neues Produkt."""
        scenario = (
            f"Online-Shop 1of10.de plant ein neues Produkt:\n"
            f"Name: {product_name}\n"
            f"Preis: {price}€\n"
            f"Kategorie: {category}\n"
            f"Besonderheit: 10% Chance auf vollständige Kaufpreiserstattung.\n\n"
            f"Frage: Wie hoch ist die erwartete Nachfrage?\n"
            f"Bewerte: Kaufinteresse, Preisbereitschaft, Vergleich zu Konkurrenz."
        )
        return await self.simulate_customer_reaction(
            scenario=scenario,
            product_data={"name": product_name, "price": price, "category": category},
        )

    def _build_seed_data(self, product_data: dict) -> str:
        """Baut den Seed-Text für die Simulation."""
        return (
            "1of10.de ist ein deutscher Online-Shop für Software-Lizenzen.\n"
            "Geschäftsmodell: Jeder 10. Kauf wird auf Kulanz erstattet (ShuffleBag-Mechanik).\n"
            "Zielgruppe: Tech-affine Deutsche, 25-45 Jahre.\n"
            "Produkte: Windows, Office, Adobe, Antivirus, Server-Software.\n"
            "Preise: 11,99€ - 179,99€.\n"
            "Alleinstellungsmerkmal: Gamified Refund (kein Gewinnspiel, Kulanzerstattung).\n"
            f"Produktdaten: {product_data}"
        )

    def _parse_prediction(self, raw_result: dict) -> dict:
        """Parse das MiroFish-Ergebnis in ein standardisiertes Format."""
        return {
            "prediction": raw_result.get("report", raw_result.get("result", {})),
            "agents_simulated": raw_result.get("agent_count", 0),
            "confidence": raw_result.get("confidence", "medium"),
            "recommendations": raw_result.get("recommendations", []),
            "raw": raw_result,
        }


# Singleton
mirofish = MiroFishClient()
