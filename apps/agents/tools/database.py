"""
Agent Tools — Database interactions.
Used by multiple agents for reading/writing order and product data.
"""

from langchain_core.tools import tool


@tool
def query_orders(status: str = "ALL", limit: int = 20) -> dict:
    """Query orders from the database, optionally filtered by status.
    
    Args:
        status: Filter by order status (PENDING, PAID, DELIVERED, REFUNDED, ALL)
        limit: Maximum number of orders to return
    """
    # Stub — in production, this would query the PostgreSQL database via HTTP
    return {
        "orders": [],
        "total": 0,
        "filter": status,
        "note": "Stub — connect to Next.js API for real data",
    }


@tool
def get_product_info(sku: str) -> dict:
    """Get product information including current prices and stock level.
    
    Args:
        sku: The product SKU
    """
    # Stub
    return {
        "sku": sku,
        "note": "Stub — connect to Next.js API for real data",
    }


@tool
def update_sell_price(sku: str, new_price: float, reason: str) -> dict:
    """Update the selling price of a product. Requires policy check (Class 3).
    
    Args:
        sku: The product SKU to update
        new_price: The new selling price in EUR
        reason: Justification for the price change
    """
    # Stub — in production:
    # 1. Call policy check via HTTP
    # 2. If allowed, update the price in the database
    return {
        "sku": sku,
        "new_price": new_price,
        "status": "STUB_NOT_EXECUTED",
        "note": "Would require policy check (Class 3) before execution",
    }
