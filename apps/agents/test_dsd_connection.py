"""
Quick smoke test for DSD Europe API connectivity.
Run: cd apps/agents && python test_dsd_connection.py

DSD API v3 — https://www.dsdeurope.nl/api2s/
"""

import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

from tools.dsd_client import DSDClient, DSDClientError


def pp(data: dict) -> str:
    """Pretty-print a dict."""
    return json.dumps(data, indent=2, ensure_ascii=False, default=str)[:1000]


async def main():
    print("=" * 60)
    print("DSD Europe API v3 — Verbindungstest")
    print("=" * 60)

    base_url = os.getenv("DSD_API_BASE_URL", "")
    username = os.getenv("DSD_API_USERNAME", "")
    print(f"Base URL:  {base_url}")
    print(f"Username:  {username}")
    print(f"Password:  {'*' * 8} (konfiguriert)" if os.getenv("DSD_API_PASSWORD") else "Password:  NICHT KONFIGURIERT!")
    print()

    try:
        client = DSDClient()

        # Step 1: Login
        print("[1] Login (login.json)...")
        try:
            login_result = await client.login()
            print(f"    ✓ Login erfolgreich")
            print(f"    {pp(login_result)}")
        except DSDClientError as exc:
            print(f"    ✗ Login fehlgeschlagen: {exc}")
            if exc.status_code == 403:
                print(f"    → IP ist wahrscheinlich nicht auf der Whitelist!")
                print(f"    → Bitte DSD kontaktieren und diese IP freischalten lassen.")
            return 1
        print()

        # Step 2: Catalog (erste Seite)
        print("[2] Produktkatalog laden (index.json?page=1)...")
        try:
            catalog = await client.get_products(page=1)
            if isinstance(catalog, dict):
                products = catalog.get("products", catalog)
                if isinstance(products, list):
                    print(f"    ✓ {len(products)} Produkte auf Seite 1")
                    for p in products[:3]:
                        name = p.get('name_de') or p.get('name', '?')
                        code = p.get('productCode', '?')
                        price = p.get('acquisitionPrice', '?')
                        stock = p.get('stock', '?')
                        print(f"      • {code}: {name} — EK: €{price}, Bestand: {stock}")
                    if len(products) > 3:
                        print(f"      ... und {len(products) - 3} weitere")
                else:
                    print(f"    Antwort: {pp(catalog)}")
            else:
                print(f"    Antwort: {pp(catalog)}")
        except DSDClientError as exc:
            print(f"    ✗ Fehler: {exc}")
        print()

        # Step 3: Unactivated stock
        print("[3] Nicht-aktivierter Bestand (getStock.json)...")
        try:
            stock = await client.get_unactivated_stock()
            print(f"    {pp(stock)}")
        except DSDClientError as exc:
            print(f"    ✗ Fehler: {exc}")
        print()

    except DSDClientError as exc:
        print(f"FEHLER: {exc}")
        return 1

    print("=" * 60)
    print("Test abgeschlossen.")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
