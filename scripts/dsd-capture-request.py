"""
Captures a full DSD Europe API request + response (incl. all headers)
and saves it to a TXT file for DSD support (Jody van Gils).

Usage: cd /workspaces/1of10 && python scripts/dsd-capture-request.py
"""

import os
import sys
import datetime
import base64

import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

BASE_URL = os.getenv("DSD_API_BASE_URL", "").rstrip("/")
USERNAME = os.getenv("DSD_API_USERNAME", "")
PASSWORD = os.getenv("DSD_API_PASSWORD", "")

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "dsd-request-response.txt")


def main():
    if not BASE_URL or not USERNAME or not PASSWORD:
        print("ERROR: DSD_API_BASE_URL, DSD_API_USERNAME, DSD_API_PASSWORD must be set in .env")
        sys.exit(1)

    url = f"{BASE_URL}/login.json"
    auth_string = base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()

    request_headers = {
        "Accept": "application/json",
        "Cache-Control": "private",
        "Connection": "Keep-Alive",
        "Authorization": f"Basic {auth_string}",
        "User-Agent": f"httpx/{httpx.__version__}",
    }

    lines = []
    lines.append(f"DSD Europe API — Request/Response Capture")
    lines.append(f"Date: {datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    lines.append(f"Client: httpx/{httpx.__version__} (Python {sys.version.split()[0]})")
    lines.append("=" * 70)
    lines.append("")

    # ── REQUEST ──────────────────────────────────────────────────────
    lines.append(">>> REQUEST")
    lines.append("-" * 70)
    lines.append(f"GET {url} HTTP/1.1")
    lines.append(f"Host: www.dsdeurope.nl")
    for k, v in request_headers.items():
        # Mask the password in the Authorization header for the TXT
        if k == "Authorization":
            lines.append(f"{k}: Basic {auth_string}")
        else:
            lines.append(f"{k}: {v}")
    lines.append("")
    lines.append("(no request body)")
    lines.append("")

    # ── RESPONSE ─────────────────────────────────────────────────────
    print(f"Sending GET {url} ...")
    try:
        response = httpx.get(
            url,
            auth=(USERNAME, PASSWORD),
            headers={
                "Accept": "application/json",
                "Cache-Control": "private",
                "Connection": "Keep-Alive",
            },
            timeout=30.0,
            follow_redirects=True,
        )
    except httpx.ConnectError as exc:
        lines.append(">>> RESPONSE")
        lines.append("-" * 70)
        lines.append(f"CONNECTION ERROR: {exc}")
        _write(lines)
        print(f"Connection error: {exc}")
        print(f"Saved to {OUTPUT_FILE}")
        return
    except httpx.TimeoutException as exc:
        lines.append(">>> RESPONSE")
        lines.append("-" * 70)
        lines.append(f"TIMEOUT ERROR: {exc}")
        _write(lines)
        print(f"Timeout: {exc}")
        print(f"Saved to {OUTPUT_FILE}")
        return

    lines.append("<<< RESPONSE")
    lines.append("-" * 70)
    lines.append(f"HTTP/{response.http_version} {response.status_code} {response.reason_phrase}")
    for k, v in response.headers.items():
        lines.append(f"{k}: {v}")
    lines.append("")
    lines.append("<<< RESPONSE BODY")
    lines.append("-" * 70)

    body = response.text
    # Limit body to first 5000 chars
    if len(body) > 5000:
        lines.append(body[:5000])
        lines.append(f"\n... (truncated, total {len(body)} chars)")
    else:
        lines.append(body)

    lines.append("")
    lines.append("=" * 70)
    lines.append(f"Status: {response.status_code}")
    lines.append(f"Content-Length: {len(response.content)} bytes")

    if response.status_code == 403:
        lines.append("")
        lines.append("NOTE: HTTP 403 — likely IP not whitelisted on DSD side.")

    _write(lines)
    print(f"Status: {response.status_code}")
    print(f"Saved to: {OUTPUT_FILE}")


def _write(lines: list[str]):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    main()
