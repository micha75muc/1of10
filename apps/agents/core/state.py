"""
Shared state definition for the LangGraph agent orchestration.
"""

from typing import Annotated, Literal
from langgraph.graph import MessagesState


AgentName = Literal[
    "orchestrator",
    "procurement",
    "finance",
    "marketing_sales",
    "it_ops",
    "compliance",
    "simulation",
]


class AgentState(MessagesState):
    """Extended state with routing and metadata."""

    target_agent: AgentName | None = None
    agent_response: str = ""
    agent_used: str = ""
