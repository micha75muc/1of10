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

from fastapi import FastAPI, HTTPException, Header
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


# ──────────────────────────────────────────────────────────────────────
# E9 Key Delivery — internal endpoint called by Vercel Stripe webhook
# Flow: payment succeeds → webhook calls /internal/procurement/activate →
# DSD activateProduct + getActivationCodes → license key returned → emailed
# ──────────────────────────────────────────────────────────────────────

class ActivationRequest(BaseModel):
    product_code: str
    client_email: str
    reference: str  # typically the order.id for audit trail
    client_name: str | None = None


class ActivationResponse(BaseModel):
    ok: bool
    license_key: str | None = None
    certificate_id: str | None = None
    error: str | None = None
    raw: dict | None = None


def _check_internal_auth(authorization: str | None) -> None:
    expected = os.getenv("AGENTS_INTERNAL_SECRET")
    if not expected:
        raise HTTPException(500, "AGENTS_INTERNAL_SECRET not configured on server")
    if not authorization or authorization != f"Bearer {expected}":
        raise HTTPException(401, "Unauthorized")


def _extract_certificate_id(result: dict) -> str | None:
    """DSD returns varying shapes; check common keys."""
    if not isinstance(result, dict):
        return None
    for key in ("certificate_id", "certificateId", "CertificateID", "certificateID"):
        if key in result and result[key]:
            return str(result[key])
    # Sometimes nested
    for nested in ("result", "ResultArray", "data"):
        inner = result.get(nested)
        if isinstance(inner, dict):
            cid = _extract_certificate_id(inner)
            if cid:
                return cid
    return None


def _extract_license_key(codes: dict) -> str | None:
    """Find the activation code in varied DSD response shapes."""
    if not isinstance(codes, dict):
        return None
    # Direct keys
    for key in ("activation_code", "activationCode", "code", "key", "licenseKey"):
        if key in codes and codes[key]:
            return str(codes[key])
    # Array of codes
    for arr_key in ("activation_codes", "ActivationCodeArray", "codes", "ResultArray"):
        arr = codes.get(arr_key)
        if isinstance(arr, list) and arr:
            first = arr[0]
            if isinstance(first, dict):
                for k in ("activation_code", "activationCode", "code", "key"):
                    if k in first and first[k]:
                        return str(first[k])
                # Could be {"ActivationCode": {...}} wrapper
                wrapped = first.get("ActivationCode") or first.get("CodeArray")
                if isinstance(wrapped, dict):
                    for k in ("activation_code", "activationCode", "code", "key"):
                        if k in wrapped and wrapped[k]:
                            return str(wrapped[k])
            elif isinstance(first, str):
                return first
    return None


@app.post("/internal/procurement/activate", response_model=ActivationResponse)
async def activate_product_endpoint(
    req: ActivationRequest,
    authorization: str | None = Header(None),
):
    """Activate a DSD product and return the license key.

    Gated by AGENTS_INTERNAL_SECRET (shared secret with Vercel web app).
    When DSD_DELIVERY_ENABLED != "true", returns a mock key (safe default).
    """
    _check_internal_auth(authorization)

    # Safety gate — default OFF so test traffic doesn't consume real stock.
    if os.getenv("DSD_DELIVERY_ENABLED", "false").lower() != "true":
        mock_key = f"MOCK-{req.reference[:8].upper()}-XXXX-XXXX"
        return ActivationResponse(
            ok=True,
            license_key=mock_key,
            certificate_id=f"mock-{req.reference[:8]}",
            raw={"note": "DSD_DELIVERY_ENABLED is false — returning mock key"},
        )

    from tools.dsd_client import DSDClient, DSDClientError
    try:
        client = DSDClient()
        activation = await client.activate_product(
            product_code=req.product_code,
            quantity=1,
            client_email=req.client_email,
            client_name=req.client_name or req.client_email.split("@")[0],
            reference=req.reference,
        )
        cert_id = _extract_certificate_id(activation)
        if not cert_id:
            return ActivationResponse(
                ok=False,
                error=f"No certificate_id in activation response",
                raw={"activation": activation},
            )
        codes = await client.get_activation_codes(int(cert_id))
        license_key = _extract_license_key(codes)
        if not license_key:
            return ActivationResponse(
                ok=False,
                certificate_id=cert_id,
                error="Certificate created but no activation code returned",
                raw={"codes": codes},
            )
        return ActivationResponse(
            ok=True,
            license_key=license_key,
            certificate_id=cert_id,
        )
    except DSDClientError as exc:
        return ActivationResponse(ok=False, error=f"DSD error: {exc}")
    except Exception as exc:  # noqa: BLE001 — endpoint must never raise 500 silently
        logging.getLogger("activation").exception("Activation failed")
        return ActivationResponse(ok=False, error=f"{type(exc).__name__}: {exc}")
