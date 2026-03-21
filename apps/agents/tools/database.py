"""
Agent Tools — Database interactions.
Used by multiple agents for reading/writing order and product data.
"""

import logging
import os

import asyncpg
from langchain_core.tools import tool

from core.http_client import request_approval

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "")

_pool: asyncpg.Pool | None = None


async def _get_pool() -> asyncpg.Pool:
    """Lazily create and return the asyncpg connection pool."""
    global _pool
    if _pool is None:
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL is not set")
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    return _pool


@tool
async def query_orders(status: str = "ALL", limit: int = 20) -> dict:
    """Query orders from the database, optionally filtered by status.

    Args:
        status: Filter by order status (PENDING, PAID, DELIVERED, REFUNDED, ALL)
        limit: Maximum number of orders to return (max 100)
    """
    limit = min(max(1, limit), 100)
    allowed_statuses = {"PENDING", "PAID", "DELIVERED", "REFUNDED", "ALL"}
    if status not in allowed_statuses:
        return {"error": f"Invalid status. Must be one of: {', '.join(sorted(allowed_statuses))}"}

    try:
        pool = await _get_pool()

        if status == "ALL":
            rows = await pool.fetch(
                'SELECT id, "stripeSessionId", "productId", "customerEmail", '
                '"amountTotal", status, "isWinner", "refundStatus", "createdAt" '
                'FROM "Order" ORDER BY "createdAt" DESC LIMIT $1',
                limit,
            )
        else:
            rows = await pool.fetch(
                'SELECT id, "stripeSessionId", "productId", "customerEmail", '
                '"amountTotal", status, "isWinner", "refundStatus", "createdAt" '
                'FROM "Order" WHERE status = $1 ORDER BY "createdAt" DESC LIMIT $2',
                status,
                limit,
            )

        orders = [dict(row) for row in rows]
        # Convert Decimal/datetime for JSON serialization
        for order in orders:
            order["amountTotal"] = float(order["amountTotal"])
            order["createdAt"] = order["createdAt"].isoformat()

        return {"orders": orders, "total": len(orders), "filter": status}

    except Exception as e:
        logger.exception("Failed to query orders")
        return {"error": f"Database query failed: {e}"}


@tool
async def get_product_info(sku: str) -> dict:
    """Get product information including current prices and stock level.

    Args:
        sku: The product SKU
    """
    if not sku or not sku.strip():
        return {"error": "SKU must not be empty"}

    try:
        pool = await _get_pool()

        row = await pool.fetchrow(
            'SELECT id, sku, name, description, category, brand, '
            '"costPrice", "sellPrice", "minimumMargin", "stockLevel", '
            '"createdAt", "updatedAt" '
            'FROM "Product" WHERE sku = $1',
            sku.strip(),
        )

        if row is None:
            return {"error": f"Product with SKU '{sku}' not found"}

        product = dict(row)
        product["costPrice"] = float(product["costPrice"])
        product["sellPrice"] = float(product["sellPrice"])
        product["minimumMargin"] = float(product["minimumMargin"])
        product["createdAt"] = product["createdAt"].isoformat()
        product["updatedAt"] = product["updatedAt"].isoformat()

        return product

    except Exception as e:
        logger.exception("Failed to get product info for SKU %s", sku)
        return {"error": f"Database query failed: {e}"}


@tool
async def update_sell_price(sku: str, new_price: float, reason: str) -> dict:
    """Update the selling price of a product. Requires policy check (Risk Class 3).

    Args:
        sku: The product SKU to update
        new_price: The new selling price in EUR
        reason: Justification for the price change
    """
    if not sku or not sku.strip():
        return {"error": "SKU must not be empty"}
    if new_price <= 0:
        return {"error": "Price must be positive"}
    if not reason or not reason.strip():
        return {"error": "A reason for the price change is required"}

    try:
        pool = await _get_pool()

        # Verify product exists and check minimum margin
        product = await pool.fetchrow(
            'SELECT id, sku, "costPrice", "sellPrice", "minimumMargin" '
            'FROM "Product" WHERE sku = $1',
            sku.strip(),
        )
        if product is None:
            return {"error": f"Product with SKU '{sku}' not found"}

        cost_price = float(product["costPrice"])
        minimum_margin = float(product["minimumMargin"])
        margin = new_price - cost_price

        if margin < minimum_margin:
            return {
                "error": (
                    f"New price {new_price:.2f}€ would result in margin {margin:.2f}€, "
                    f"below minimum {minimum_margin:.2f}€"
                ),
                "costPrice": cost_price,
                "minimumMargin": minimum_margin,
            }

        # Risk Class 3: OPERATIONAL_WRITE — logged, execution allowed
        logger.info(
            "Price update for SKU %s: %.2f€ → %.2f€ (reason: %s)",
            sku, float(product["sellPrice"]), new_price, reason,
        )

        await pool.execute(
            'UPDATE "Product" SET "sellPrice" = $1, "updatedAt" = NOW() WHERE sku = $2',
            new_price,
            sku.strip(),
        )

        # Log to approval queue for audit trail
        try:
            await request_approval(
                agent_id="system",
                action_type="PRICE_UPDATE",
                payload={
                    "sku": sku,
                    "oldPrice": float(product["sellPrice"]),
                    "newPrice": new_price,
                    "reason": reason,
                    "riskClass": 3,
                },
            )
        except Exception:
            logger.warning("Could not log price update to approval queue (non-blocking)")

        return {
            "sku": sku,
            "oldPrice": float(product["sellPrice"]),
            "newPrice": new_price,
            "reason": reason,
            "status": "UPDATED",
            "riskClass": 3,
        }

    except Exception as e:
        logger.exception("Failed to update sell price for SKU %s", sku)
        return {"error": f"Database operation failed: {e}"}
