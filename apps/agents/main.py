"""
1of10 Agent Runtime — FastAPI + LangGraph
AI-powered business operations agents for the e-commerce platform.
"""

import os
import logging
import time

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.orchestrator import run_orchestrator

VERSION = "1.0.0"
START_TIME = time.monotonic()

AGENTS = [
    {"name": "Michael", "role": "Orchestrator", "domain": "orchestrator"},
    {"name": "Nestor", "role": "Beschaffung", "domain": "procurement"},
    {"name": "Elena", "role": "Finanzen", "domain": "finance"},
    {"name": "Inge", "role": "Marketing & Vertrieb", "domain": "marketing_sales"},
    {"name": "Martin", "role": "IT-Ops", "domain": "it_ops"},
    {"name": "Denny", "role": "Compliance", "domain": "compliance"},
    {"name": "Mira", "role": "Simulation", "domain": "simulation"},
]

cors_env = os.getenv("AGENTS_CORS_ORIGINS", "http://localhost:3000")
cors_origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]

app = FastAPI(
    title="1of10 Agent Runtime",
    description="AI Agent orchestration for the 1of10 e-commerce platform",
    version=VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    from tools.mirofish_client import mirofish
    mirofish_available = await mirofish.is_available()
    return {
        "status": "healthy",
        "version": VERSION,
        "agents": AGENTS,
        "uptime_seconds": round(time.monotonic() - START_TIME, 2),
        "integrations": {
            "mirofish": {
                "enabled": mirofish.enabled,
                "available": mirofish_available,
            },
        },
    }


class OrchestratorRequest(BaseModel):
    prompt: str
    context: dict | None = None


class OrchestratorResponse(BaseModel):
    response: str
    agent_used: str
    metadata: dict | None = None


@app.post("/api/agents/orchestrator/invoke", response_model=OrchestratorResponse)
async def invoke_orchestrator(req: OrchestratorRequest):
    result = await run_orchestrator(req.prompt, req.context)
    return result
