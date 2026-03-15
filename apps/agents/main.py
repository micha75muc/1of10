"""
1of10 Agent Runtime — FastAPI + LangGraph
AI-powered business operations agents for the e-commerce platform.
"""

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.orchestrator import run_orchestrator

app = FastAPI(
    title="1of10 Agent Runtime",
    description="AI Agent orchestration for the 1of10 e-commerce platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "1of10-agents"}


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
