"""
Agent Tools — Stripe interactions.
Used by Elena (Finance) agent.
"""

from langchain_core.tools import tool


@tool
def get_stripe_fees(period: str = "current_month") -> dict:
    """Get Stripe transaction fees for the specified period.
    
    Args:
        period: Time period for fee calculation (current_month, last_month, last_quarter)
    """
    # Stub
    return {
        "period": period,
        "total_volume": 0,
        "total_fees": 0,
        "currency": "EUR",
        "note": "Stub — connect to Stripe API for real data",
    }


@tool
def get_revenue_summary(period: str = "current_month") -> dict:
    """Get a summary of revenue including refund impact.
    
    Args:
        period: Time period for the summary
    """
    # Stub
    return {
        "period": period,
        "gross_revenue": 0,
        "refunds": 0,
        "net_revenue": 0,
        "winner_count": 0,
        "note": "Stub — connect to database for real data",
    }
