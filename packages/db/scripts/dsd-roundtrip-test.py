"""
Standalone DSD Sandbox Roundtrip Test.

Macht einen vollständigen quickOrder → getActivationCodes Zyklus gegen
DSD-Sandbox (Account medialess_apitest) und gibt den geliferten Lizenz-
Schlüssel aus. Zweck: vor jedem Live-Sprint sicherstellen, dass die
externe Abhängigkeit gesund ist, ohne den ganzen Vercel-Stack zu fahren.

Aufruf:
    python dsd-roundtrip-test.py --user medialess_apitest --password <PW> \\
                                  [--product DSD150002] [--email me@example.com]

Erwartete Ausgabe (Sandbox):
    ✅ login OK
    ✅ quickOrder OK   certificate_id=53683XX  order_id=...
    ✅ getActivationCodes OK   key=XXXX-XXXX-XXXX-XXXX

Sandbox-Hinweise (laut Jody, 29.04.2026):
- DSD150002 (Trend Micro IS) verlangt phone als mandatory client field
- DSD300031 (AVG TuneUp) verlangt company als mandatory client field
- Wir senden defensiv alle Felder mit; DSD ignoriert ungenutzte.
"""

import argparse
import sys
import time
from datetime import datetime

import requests

DSD_BASE = "https://www.dsdeurope.nl/api2s"


def get(s: requests.Session, endpoint: str, params: dict | None = None) -> dict:
    r = s.get(f"{DSD_BASE}/{endpoint}", params=params, timeout=60)
    r.raise_for_status()
    body = r.json()
    if isinstance(body, dict) and "response" in body:
        body = body["response"]
    if isinstance(body, dict) and body.get("status") == "failure":
        raise RuntimeError(f"DSD {endpoint} failed: {body.get('message')}")
    return body


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--user", required=True)
    ap.add_argument("--password", required=True)
    ap.add_argument("--product", default="DSD150002",
                    help="DSD product code to order (default: Trend Micro IS)")
    ap.add_argument("--email", default="info@medialess.de",
                    help="Customer email (sandbox — never receives real mail)")
    ap.add_argument("--first-name", default="Smoke")
    ap.add_argument("--last-name", default="Test")
    ap.add_argument("--phone", default="+49 89 123456")
    ap.add_argument("--company", default="medialess GmbH")
    ap.add_argument("--reference", default=None,
                    help="External reference (default: rt-<UTC-stamp>)")
    args = ap.parse_args()

    ref = args.reference or f"rt-{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}"

    s = requests.Session()
    s.auth = (args.user, args.password)
    s.headers.update({
        "Accept": "application/json",
        "Cache-Control": "private",
        "Connection": "Keep-Alive",
        "User-Agent": "1of10-roundtrip/1.0",
    })

    print(f"DSD base:  {DSD_BASE}")
    print(f"User:      {args.user}")
    print(f"Product:   {args.product}")
    print(f"Email:     {args.email}")
    print(f"Reference: {ref}")
    print()

    # 1) login
    t0 = time.time()
    get(s, "login.json")
    print(f"✅ login OK                       ({(time.time()-t0)*1000:.0f} ms)")

    # 2) quickOrder
    t1 = time.time()
    qo = get(s, "quickOrder.json", params={
        "product_code": args.product,
        "quantity": 1,
        "email": args.email,
        "purchase_type": 0,
        "reference": ref,
        "name": f"{args.first_name} {args.last_name}",
        "first_name": args.first_name,
        "last_name": args.last_name,
        "phone": args.phone,
        "company": args.company,
    })
    cert_id = qo.get("certificate_id") or qo.get("certificateId")
    order_id = qo.get("order_id") or qo.get("orderId")
    print(f"✅ quickOrder OK                  ({(time.time()-t1)*1000:.0f} ms)  "
          f"certificate_id={cert_id}  order_id={order_id}")

    if not cert_id:
        print("⚠️  No certificate_id in response — full body:")
        print(qo)
        return 1

    # 3) getActivationCodes (with brief retry — DSD can take a moment)
    key = None
    for attempt in range(5):
        t2 = time.time()
        try:
            ac = get(s, "getActivationCodes.json", params={"certificate_id": cert_id})
        except RuntimeError as exc:
            print(f"   attempt {attempt+1}/5: {exc}")
            time.sleep(2)
            continue
        codes = ac.get("activationCodes") or ac.get("activation_codes") or []
        if isinstance(codes, list) and codes:
            first = codes[0]
            if isinstance(first, dict):
                key = first.get("activationCode") or first.get("code")
            else:
                key = str(first)
            print(f"✅ getActivationCodes OK          ({(time.time()-t2)*1000:.0f} ms)  "
                  f"key={key}")
            break
        elif "activationCode" in ac:
            key = ac.get("activationCode")
            print(f"✅ getActivationCodes OK          ({(time.time()-t2)*1000:.0f} ms)  "
                  f"key={key}")
            break
        else:
            print(f"   attempt {attempt+1}/5: no key yet, response keys={list(ac.keys())}")
            time.sleep(2)

    if not key:
        print("⚠️  No key after retries.")
        return 1

    print()
    print(f"Roundtrip OK. Sandbox key: {key}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
