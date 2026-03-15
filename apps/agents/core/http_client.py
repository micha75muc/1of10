"""
HTTP client for communication with the Next.js backend.
Used by agents to interact with the approval queue and database.
"""

import os
import httpx

NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://localhost:3000")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "dev-admin-key-change-in-production")


async def request_approval(agent_id: str, action_type: str, payload: dict) -> dict:
    """Submit an action to the approval queue via the Next.js API."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{NEXTJS_API_URL}/api/admin/approvals",
            json={
                "agentId": agent_id,
                "actionType": action_type,
                "payload": payload,
            },
            headers={"x-admin-api-key": ADMIN_API_KEY},
        )
        return response.json()


async def get_approval_status(approval_id: str) -> dict:
    """Check the status of an approval item."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{NEXTJS_API_URL}/api/admin/approvals?status=ALL",
            headers={"x-admin-api-key": ADMIN_API_KEY},
        )
        data = response.json()
        for item in data.get("items", []):
            if item["id"] == approval_id:
                return item
        return {"error": "Approval item not found"}
