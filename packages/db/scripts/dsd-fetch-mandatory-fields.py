#!/usr/bin/env python3
"""Self-contained DSD view.json fetcher.

Reads SKUs from argv (comma-separated), outputs `{sku: mandatoryClientFields}`
JSON map to stdout. Logs to stderr.

Why Python and not Node?
    The host where DSD's IP-allowlist accepts us (Hetzner agents VPS at
    178.104.52.53) has no Node runtime, just Python. Keeping this script
    dependency-free (stdlib only) lets us scp + run it without bootstrapping.

Why a separate fetch step (this) and apply step (apply-dsd-mandatory-fields.mjs)?
    DSD whitelists by source IP — fetch must run on a whitelisted host.
    Neon is reachable from anywhere — apply runs locally, transactionally,
    against Prisma. JSON file is the boundary.

Quirks documented inline below:
  * DSD returns the literal string "None are mandatory" for products
    without required fields (handled in apply-step).
  * mandatoryClientFields uses "email, first_name, last_name" with spaces;
    we strip them to match our DSD_FIELD_MAP keys in lib/key-delivery.ts.
  * DSD's WAF blocks the default `Python-urllib/3.x` User-Agent — we set
    a custom UA.
  * Field name in `view.json` response is `productCode` (camelCase), not
    `product_code`.

Usage (run from a DSD-whitelisted host with /opt/1of10/.env loaded):
    set -a && source /opt/1of10/.env && set +a
    python3 dsd-fetch-mandatory-fields.py "SKU1,SKU2,SKU3" > result.json
"""
import base64
import json
import os
import sys
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from http.cookiejar import CookieJar

BASE = os.environ.get("DSD_API_BASE_URL", "").rstrip("/")
USER = os.environ.get("DSD_API_USERNAME", "")
PASS = os.environ.get("DSD_API_PASSWORD", "")
if not (BASE and USER and PASS):
    print("DSD env missing", file=sys.stderr)
    sys.exit(1)

basic = "Basic " + base64.b64encode(f"{USER}:{PASS}".encode()).decode()


def http(method, path, body=None, cookie=None):
    url = f"{BASE}{path}"
    headers = {
        "Authorization": basic,
        "Accept": "application/json",
        "User-Agent": "1of10-backfill/1.0",
    }
    data = None
    if body is not None:
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        data = urlencode(body, doseq=True).encode()
    if cookie:
        headers["Cookie"] = cookie
    req = Request(url, data=data, method=method, headers=headers)
    with urlopen(req, timeout=30) as r:
        raw = r.read()
        set_cookies = r.headers.get_all("Set-Cookie") or []
    cookies = "; ".join(c.split(";")[0] for c in set_cookies if c)
    return raw, cookies


def login():
    raw, cookies = http("GET", "/login.json")
    if not cookies:
        raise RuntimeError("login: no cookie")
    return cookies


def view_batch(cookie, skus):
    body = [(str(i), s) for i, s in enumerate(skus)]
    raw, _ = http("POST", "/view.json", body=body, cookie=cookie)
    j = json.loads(raw)
    if isinstance(j, dict) and j.get("response", {}).get("error_code") == 12:
        raise RuntimeError(f"DSD blocked: {j['response'].get('message')}")
    products = []
    if isinstance(j, dict):
        if isinstance(j.get("products"), list):
            for p in j["products"]:
                products.append(p.get("ProductArray") or p)
        elif j.get("ProductArray"):
            products.append(j["ProductArray"])
        elif j.get("product_code") or j.get("code"):
            products.append(j)
        else:
            for v in j.values():
                if isinstance(v, dict) and v.get("ProductArray"):
                    products.append(v["ProductArray"])
    return products


sku_arg = sys.argv[1] if len(sys.argv) > 1 else ""
skus = []
seen = set()
for s in sku_arg.split(","):
    s = s.strip()
    if not s or s.startswith("TEST-") or s in seen:
        continue
    seen.add(s)
    skus.append(s)

cookie = login()
print(f"logged in, fetching {len(skus)} SKUs in batches of 20…", file=sys.stderr)

result = {}
batches = [skus[i : i + 20] for i in range(0, len(skus), 20)]
for n, batch in enumerate(batches, 1):
    try:
        products = view_batch(cookie, batch)
        for p in products:
            code = (
                p.get("productCode")
                or p.get("product_code")
                or p.get("code")
                or p.get("sku")
            )
            fields = p.get("mandatoryClientFields")
            if fields is None:
                fields = p.get("mandatory_client_fields")
            if code and fields is not None:
                # Normalise: remove whitespace, ensure CSV without spaces
                clean = ",".join(
                    f.strip() for f in str(fields).split(",") if f.strip()
                )
                result[code] = clean
        print(f"  batch {n}/{len(batches)}: {len(products)} products", file=sys.stderr)
    except Exception as e:
        print(f"  batch {n}/{len(batches)} FAILED: {e}", file=sys.stderr)

print(json.dumps(result, indent=2))
