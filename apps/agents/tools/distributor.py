"""
Agent Tools — DSD Europe Distributor API interactions.
Used by Nestor (Procurement) agent.

DSD API v3 — Base: https://www.dsdeurope.nl/api2s/
Endpoints: login.json, index.json, view.json, order.json, getStock.json, etc.
"""

import logging

from langchain_core.tools import tool

from tools.dsd_client import DSDClientError, get_dsd_client

logger = logging.getLogger("distributor_tools")


@tool
async def get_distributor_price(product_code: str) -> dict:
    """Get the current wholesale (acquisition) price from DSD Europe.

    Risk Class: 1 (READ_ONLY) — no approval needed.

    Args:
        product_code: The DSD product code (e.g. 'DSD110001')
    """
    try:
        client = get_dsd_client()
        result = await client.get_price(product_code)
        logger.info("Price lookup for %s: %s", product_code, result)
        return result
    except DSDClientError as exc:
        logger.error("DSD API error for price lookup %s: %s", product_code, exc)
        return {"product_code": product_code, "error": f"Distributor API error: {exc}"}


@tool
async def check_distributor_stock(product_code: str) -> dict:
    """Check the stock availability at DSD Europe for a given product code.

    Risk Class: 1 (READ_ONLY) — no approval needed.

    Args:
        product_code: The DSD product code to check (e.g. 'DSD110001')
    """
    try:
        client = get_dsd_client()
        result = await client.check_stock(product_code)
        logger.info("Stock check for %s: %s", product_code, result)
        return result
    except DSDClientError as exc:
        logger.error("DSD API error for stock check %s: %s", product_code, exc)
        return {"product_code": product_code, "error": f"Distributor API error: {exc}"}


@tool
async def browse_distributor_catalog(page: int = 1) -> dict:
    """Browse the DSD Europe product catalog (paginated, 100 products/page).

    Risk Class: 1 (READ_ONLY) — no approval needed.

    Args:
        page: Page number (starting at 1)
    """
    try:
        client = get_dsd_client()
        result = await client.get_products(page)
        logger.info("Catalog page %d loaded", page)
        return {"page": page, "results": result}
    except DSDClientError as exc:
        logger.error("DSD API error browsing catalog page %d: %s", page, exc)
        return {"page": page, "error": f"Distributor API error: {exc}"}


@tool
async def view_distributor_products(product_codes: list[str]) -> dict:
    """Get detailed info for specific DSD product codes.

    Risk Class: 1 (READ_ONLY) — no approval needed.

    Args:
        product_codes: List of DSD codes, e.g. ['DSD110001', 'DSD110002']
    """
    try:
        client = get_dsd_client()
        result = await client.view_products(product_codes)
        logger.info("View products %s: loaded", product_codes)
        return {"product_codes": product_codes, "results": result}
    except DSDClientError as exc:
        logger.error("DSD API error viewing products %s: %s", product_codes, exc)
        return {"product_codes": product_codes, "error": f"Distributor API error: {exc}"}


@tool
async def check_distributor_connection() -> dict:
    """Test connection to the DSD Europe API.

    Risk Class: 1 (READ_ONLY) — no approval needed.
    Use this to verify that the API credentials and IP whitelist are working.
    """
    try:
        client = get_dsd_client()
        result = await client.check_connection()
        logger.info("DSD connection check: %s", result)
        return result
    except DSDClientError as exc:
        logger.error("DSD connection check failed: %s", exc)
        return {"connected": False, "error": str(exc)}
