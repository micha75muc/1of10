"""
Standalone DSD-Catalog-Fetcher + Mapper.

Läuft auf einer Class-A-Maschine (nur Python + pg8000), ohne dass
apps/agents oder node-toolchain gebraucht werden.

1) Loggt sich gegen DSD ein (HTTP Basic + Session-Cookie).
2) Holt den vollständigen Produkt-Katalog (paginated, 100/Seite).
3) Mappt unsere DB-Produkte auf DSD-Codes via Brand + User-Anzahl
   + Jahre + Produkt-Typ + OEM-Flag (gleiche Heuristik wie
   packages/db/scripts/map-dsd-codes.mjs).
4) Schreibt die HIGH-Confidence-Treffer als `dsdProductCode` in
   die Neon-DB.

Aufruf:
    python dsd-fetch-and-map.py --user medialess_apitest --password <PW>
                                 --db <neon-url>
    # Default ist Dry-Run. Schreiben nur mit --apply.

Endpoints:
    GET https://www.dsdeurope.nl/api2s/login.json    (Cookie etablieren)
    GET https://www.dsdeurope.nl/api2s/index.json?page=N

Antwortformat:
    { "response": { "products": [{"ProductArray": {...}}, ...], "pagination": {...} } }
"""

import argparse
import json
import re
import ssl
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import pg8000.dbapi
import requests

DSD_BASE = "https://www.dsdeurope.nl/api2s"
CACHE_FILE = Path(__file__).with_name("dsd_full_catalog.cache.json")


# ────────────────────────────────────────────────────────── DSD ──────────

def dsd_session(user: str, pw: str) -> requests.Session:
    s = requests.Session()
    s.auth = (user, pw)
    s.headers.update({
        "Accept": "application/json",
        "Cache-Control": "private",
        "Connection": "Keep-Alive",
        "User-Agent": "1of10-mapper/1.0",
    })
    r = s.get(f"{DSD_BASE}/login.json", timeout=30, allow_redirects=True)
    r.raise_for_status()
    body = r.json().get("response", r.json())
    if isinstance(body, dict) and body.get("status") == "failure":
        raise RuntimeError(f"DSD login failed: {body.get('message')}")
    return s


def fetch_catalog(s: requests.Session) -> list[dict]:
    products: list[dict] = []
    page = 1
    while True:
        r = s.get(f"{DSD_BASE}/index.json", params={"page": page}, timeout=60)
        r.raise_for_status()
        body = r.json().get("response", r.json())
        items = body.get("products", []) or []
        if not items:
            break
        for item in items:
            if isinstance(item, dict) and "ProductArray" in item:
                products.append(item["ProductArray"])
            elif isinstance(item, dict):
                products.append(item)
        pagination = body.get("pagination", {}) or {}
        total_pages = int(pagination.get("totalPages", 0) or 0)
        print(f"  page {page}: +{len(items)} (total so far {len(products)})")
        if total_pages and page >= total_pages:
            break
        page += 1
        time.sleep(0.3)  # be polite
        if page > 100:  # hard stop
            break
    return products


# ────────────────────────────────────────────────────────── Mapping ──────

def parse_spec(name: str) -> tuple[int | None, int | None]:
    lower = name.lower()
    users = years = None
    m = re.search(r"(\d+)\s*(?:-|\s)?(?:pc|device|ger(?:ä|a)te?|user|mac|gerat)s?\b", lower)
    if m:
        users = int(m.group(1))
    if re.search(r"unlimited|unbegrenzt", lower):
        users = 999
    m = re.search(r"(\d+)\s*(?:jahr|year)", lower)
    if m:
        years = int(m.group(1))
    return users, years


def norm_brand(b: str | None) -> str:
    return re.sub(r"\s+", "", re.sub(r"[™®]", "", (b or "").lower())).strip()


def product_type(name: str) -> str:
    l = (name or "").lower()
    pairs = [
        (r"total\s*protection", "totalprotection"),
        (r"internet\s*security", "internetsecurity"),
        (r"total\s*security", "totalsecurity"),
        (r"premium\s*security", "premiumsecurity"),
        (r"\b360\b.*premium", "360premium"),
        (r"\b360\b.*deluxe", "360deluxe"),
        (r"\b360\b.*standard", "360standard"),
        (r"tune\s*up", "tuneup"),
        (r"antivirus\s*plus", "avplus"),
        (r"anti\s*track", "antitrack"),
        (r"\bvpn\b", "vpn"),
        (r"safe\s*kids", "safekids"),
        (r"\bsafe\b", "safe"),
        (r"ultimate", "ultimate"),
        (r"fine\s*reader", "finereader"),
        (r"nod32", "nod32"),
        (r"smart\s*security", "smartsecurity"),
        (r"family\s*pack", "familypack"),
        (r"dome\s*complete", "domecomplete"),
        (r"dome\s*advanced", "domeadvanced"),
        (r"dome\s*essential", "domeessential"),
        (r"dome", "dome"),
        (r"antivirus", "antivirus"),
        (r"cyber\s*protect", "cyberprotect"),
    ]
    for pat, key in pairs:
        if re.search(pat, l):
            return key
    return "other"


def is_oem(name: str) -> bool:
    return bool(re.search(r"\boem\b", name or "", re.I))


def is_subscription(name: str) -> bool:
    return bool(re.search(r"subscription", name or "", re.I)) and not re.search(
        r"non[-\s]?subscription", name or "", re.I
    )


def map_one(db_p: dict, dsd_products: list[dict]) -> dict:
    db_users, db_years = parse_spec(db_p["name"])
    db_type = product_type(db_p["name"])
    db_brand = norm_brand(db_p["brand"])
    db_oem = is_oem(db_p["name"])

    candidates: list[dict] = []
    for d in dsd_products:
        d_brand = norm_brand(d.get("brandName"))
        if d_brand != db_brand and not (db_brand == "panda" and d_brand == "pandasecurity"):
            continue
        d_name = d.get("name") or d.get("nameDefault") or ""
        d_users_n, d_years_n = parse_spec(d_name)
        d_users = d_users_n or (int(d.get("numberOfUsers") or 0) or None)
        d_years = d_years_n or (int(d.get("yearsValid") or 0) or None)
        d_type = product_type(d_name)
        d_oem = is_oem(d_name)
        d_sub = is_subscription(d_name)

        score = 0
        hard = True
        if db_users is not None and d_users is not None:
            if d_users == db_users:
                score += 40
            else:
                hard = False
        if db_years is not None and d_years is not None:
            if d_years == db_years:
                score += 30
            else:
                hard = False
        if d_type != "other" and db_type != "other":
            if d_type == db_type:
                score += 50
            else:
                hard = False
        if d_oem == db_oem:
            score += 5
        else:
            hard = False
        if not d_sub:
            score += 3
        try:
            stock = int(d.get("stock") or 0)
        except (TypeError, ValueError):
            stock = 0
        if stock > 5:
            score += 3

        candidates.append({"score": score, "hard": hard, "dsd": d})

    candidates.sort(key=lambda c: (c["hard"], c["score"]), reverse=True)
    top = candidates[0] if candidates else None
    if top and top["hard"] and top["score"] >= 120:
        confidence = "high"
    elif top and top["score"] >= 80:
        confidence = "medium"
    elif top and top["score"] > 0:
        confidence = "low"
    else:
        confidence = "none"

    return {
        "sku": db_p["sku"],
        "name": db_p["name"],
        "current_dsd": db_p.get("dsdProductCode"),
        "confidence": confidence,
        "top": top,
        "alternatives": candidates[1:3],
    }


# ────────────────────────────────────────────────────────── DB ───────────

def db_connect(url: str):
    u = urlparse(url)
    return pg8000.dbapi.connect(
        host=u.hostname,
        port=u.port or 5432,
        user=u.username,
        password=u.password,
        database=u.path.lstrip("/"),
        ssl_context=ssl.create_default_context(),
    )


def fetch_db_products(conn) -> list[dict]:
    cur = conn.cursor()
    cur.execute(
        'SELECT id, sku, name, brand, "dsdProductCode" FROM "Product" '
        'ORDER BY brand ASC, "sellPrice" ASC'
    )
    rows = cur.fetchall()
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in rows]


# ────────────────────────────────────────────────────────── Main ─────────

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--user", required=True, help="DSD username (e.g. medialess_apitest)")
    ap.add_argument("--password", required=True)
    ap.add_argument("--db", required=True, help="Neon Postgres URL")
    ap.add_argument("--apply", action="store_true", help="Write HIGH matches to DB")
    ap.add_argument("--use-cache", action="store_true",
                    help="Skip DSD fetch, use cached catalog from previous run")
    ap.add_argument("--only-missing", action="store_true",
                    help="Only consider DB products with NULL dsdProductCode")
    args = ap.parse_args()

    # 1. Catalog
    if args.use_cache and CACHE_FILE.exists():
        print(f"Loading cached catalog from {CACHE_FILE}")
        dsd_products = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    else:
        print(f"Logging into DSD as {args.user} ...")
        s = dsd_session(args.user, args.password)
        print("Fetching DSD catalog ...")
        dsd_products = fetch_catalog(s)
        CACHE_FILE.write_text(json.dumps(dsd_products, indent=2), encoding="utf-8")
        print(f"  cached {len(dsd_products)} products to {CACHE_FILE}")

    # 2. DB
    conn = db_connect(args.db)
    db_products = fetch_db_products(conn)
    if args.only_missing:
        db_products = [p for p in db_products if not p.get("dsdProductCode")]
    print(f"DB products to map: {len(db_products)}")

    # 3. Map
    results = [map_one(p, dsd_products) for p in db_products]
    counts = {"high": 0, "medium": 0, "low": 0, "none": 0}
    for r in results:
        counts[r["confidence"]] += 1
    print("\n=== Mapping Report ===")
    for c, n in counts.items():
        print(f"  {c:7s}: {n}")

    print("\n=== HIGH confidence matches ===")
    for r in results:
        if r["confidence"] != "high":
            continue
        t = r["top"]["dsd"]
        marker = " [NEW]" if not r["current_dsd"] else (" [REPLACE]" if r["current_dsd"] != t.get("productCode") else "")
        print(f"  {r['sku']:<32s} → {t.get('productCode'):<12s} "
              f"(stock {t.get('stock')}){marker} | {(t.get('name') or '')[:60]}")

    print("\n=== MEDIUM confidence (review needed) — first 30 ===")
    medium = [r for r in results if r["confidence"] == "medium"][:30]
    for r in medium:
        t = r["top"]["dsd"]
        print(f"  {r['sku']:<32s} → {t.get('productCode'):<12s} "
              f"(score {r['top']['score']}) | {(t.get('name') or '')[:50]}")

    print("\n=== NO match ===")
    for r in [x for x in results if x["confidence"] == "none"]:
        print(f"  {r['sku']:<32s} | {r['name'][:60]}")

    # 4. Apply
    if args.apply:
        cur = conn.cursor()
        updated = 0
        for r in results:
            if r["confidence"] != "high":
                continue
            code = r["top"]["dsd"].get("productCode")
            if not code or r["current_dsd"] == code:
                continue
            cur.execute(
                'UPDATE "Product" SET "dsdProductCode"=%s WHERE sku=%s',
                (code, r["sku"]),
            )
            updated += 1
        conn.commit()
        cur.close()
        print(f"\n✅ Wrote dsdProductCode for {updated} products.")
    else:
        print("\n(Dry-run — use --apply to write to DB)")

    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
