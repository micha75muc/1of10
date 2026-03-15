"""
Agent Tools — Distributor API interactions.
Used by Nestor (Procurement) agent.
"""

from langchain_core.tools import tool


@tool
def get_distributor_price(sku: str) -> dict:
    """Get the current wholesale price from the distributor for a given SKU.
    
    Args:
        sku: The product SKU to look up (e.g. 'MS-365-BUS-STD')
    """
    # Stub — in production, this would call the actual distributor API
    mock_prices = {
        "MS-365-BUS-STD": {"price": 10.20, "currency": "EUR", "available": True},
        "MS-365-BUS-PREM": {"price": 18.00, "currency": "EUR", "available": True},
        "ADOBE-CC-ALL": {"price": 45.00, "currency": "EUR", "available": True},
    }
    result = mock_prices.get(sku)
    if result:
        return {"sku": sku, **result}
    return {"sku": sku, "error": "SKU not found at distributor"}


@tool
def check_distributor_stock(sku: str) -> dict:
    """Check the stock availability at the distributor for a given SKU.
    
    Args:
        sku: The product SKU to check
    """
    # Stub
    return {"sku": sku, "stock": 999, "available": True}
