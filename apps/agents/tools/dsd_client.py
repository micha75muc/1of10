"""
DSD Europe API Client — Async HTTP client for the DSD distribution platform.
API Manual Version: 3.3.0

Base URL: https://www.dsdeurope.nl/api2s/
Auth: HTTP Basic Auth + cookie-based sessions.
Format: JSON (.json endpoints)

Used by Nestor (Procurement agent) for:
- Product catalog & pricing (Risk Class 1: READ_ONLY)
- Stock checks (Risk Class 1: READ_ONLY)
- Order placement (Risk Class 4: HIGH_RISK_EXECUTION — requires approval)

All API calls are logged for audit/compliance purposes.
"""

import os
import logging
from typing import Any

import httpx

logger = logging.getLogger("dsd_client")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s [DSD-API] %(levelname)s %(message)s")
    )
    logger.addHandler(handler)


class DSDClientError(Exception):
    """Raised when the DSD API returns an error."""

    def __init__(self, message: str, status_code: int | None = None):
        self.status_code = status_code
        super().__init__(message)


class DSDClient:
    """Async HTTP client for the DSD Europe distribution API v3.

    API uses: Basic Auth + session cookies. Each endpoint is called as
    /api2s/<function>.json (or .xml). Auth credentials are sent with
    every request; cookies maintain the session.
    """

    TIMEOUT = 30.0

    def __init__(
        self,
        base_url: str | None = None,
        username: str | None = None,
        password: str | None = None,
    ):
        self.base_url = (base_url or os.getenv("DSD_API_BASE_URL", "")).rstrip("/")
        self._username = username or os.getenv("DSD_API_USERNAME", "")
        self._password = password or os.getenv("DSD_API_PASSWORD", "")

        if not self.base_url:
            raise DSDClientError("DSD_API_BASE_URL is not configured")
        if not self._username or not self._password:
            raise DSDClientError("DSD API credentials are not configured")

        # Persistent cookie jar for session management
        self._cookies = httpx.Cookies()
        self._logged_in = False

    def _auth(self) -> tuple[str, str]:
        """Return (username, password) tuple for httpx auth."""
        return (self._username, self._password)

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute an authenticated API request with session cookies.

        Args:
            method: HTTP method (GET or POST)
            endpoint: e.g. "index.json", "view.json"
            params: query string parameters (for GET requests)
            data: form-encoded body (for POST requests like view, createClient)
        """
        url = f"{self.base_url}/{endpoint}"
        logger.info("DSD API %s %s params=%s", method, endpoint, params)

        async with httpx.AsyncClient(
            timeout=self.TIMEOUT,
            verify=True,
            cookies=self._cookies,
            follow_redirects=True,
        ) as client:
            try:
                kwargs: dict[str, Any] = {
                    "auth": self._auth(),
                    "headers": {
                        "Accept": "application/json",
                        "Cache-Control": "private",
                        "Connection": "Keep-Alive",
                    },
                }
                if params:
                    kwargs["params"] = params
                if data:
                    kwargs["data"] = data

                response = await client.request(method, url, **kwargs)

                # Capture session cookies
                self._cookies.update(response.cookies)

            except httpx.ConnectError as exc:
                logger.error("DSD API connection error: %s", exc)
                raise DSDClientError(f"Connection failed: {exc}") from exc
            except httpx.TimeoutException as exc:
                logger.error("DSD API timeout: %s", exc)
                raise DSDClientError(f"Request timed out: {exc}") from exc

        logger.info(
            "DSD API response: status=%d length=%d",
            response.status_code,
            len(response.content),
        )

        if response.status_code == 401:
            raise DSDClientError("Authentication failed — check DSD credentials", 401)
        if response.status_code == 403:
            raise DSDClientError(
                "Access denied — IP may not be whitelisted or insufficient permissions",
                403,
            )
        if response.status_code >= 400:
            raise DSDClientError(
                f"API error: {response.status_code} {response.text}",
                response.status_code,
            )

        if not response.content:
            return {"status": "ok"}

        try:
            result = response.json()
        except Exception:
            return {"raw": response.text, "status_code": response.status_code}

        # DSD API wraps responses in {"response": {...}}
        if isinstance(result, dict) and "response" in result:
            result = result["response"]

        # DSD API returns {"status": "failure", "message": "..."} on errors
        if isinstance(result, dict) and result.get("status") == "failure":
            raise DSDClientError(
                result.get("message", "Unknown API error"),
                response.status_code,
            )

        return result

    # ── Session ─────────────────────────────────────────────────────────

    async def login(self) -> dict:
        """Authenticate and establish a session. Must be called before
        other endpoints (or they will auto-login)."""
        result = await self._request("GET", "login.json")
        self._logged_in = True
        logger.info("DSD login successful")
        return result

    async def _ensure_login(self) -> None:
        if not self._logged_in:
            await self.login()

    # ── Product catalog (Risk Class 1: READ_ONLY) ──────────────────────

    async def get_products(self, page: int = 1) -> dict:
        """Get paginated product catalog (100 products per page).

        Returns product list with: id, name, productCode, brandName,
        price (advisory), acquisitionPrice (our cost), stock, options, etc.
        """
        await self._ensure_login()
        return await self._request("GET", "index.json", params={"page": page})

    async def view_products(self, product_codes: list[str]) -> dict:
        """Get detailed info for specific products by their DSD product codes.

        Args:
            product_codes: List of DSD codes, e.g. ['DSD110001', 'DSD110002']
        """
        await self._ensure_login()
        # DSD API expects form-encoded array: 0=DSD110001&1=DSD110002
        data = {str(i): code for i, code in enumerate(product_codes)}
        return await self._request("POST", "view.json", data=data)

    async def get_price(self, product_code: str) -> dict:
        """Get pricing for a specific product.

        Returns acquisitionPrice (our cost) and price (advisory/retail).
        """
        result = await self.view_products([product_code])
        # view returns a list or dict with product data
        products = result if isinstance(result, list) else result.get("products", [result])
        if not products:
            return {"product_code": product_code, "error": "Product not found"}

        product = products[0] if isinstance(products, list) else products
        return {
            "product_code": product_code,
            "name": product.get("name", ""),
            "name_de": product.get("name_de", ""),
            "acquisition_price": product.get("acquisitionPrice"),
            "advisory_price": product.get("price"),
            "currency": "EUR",
            "stock": product.get("stock", 0),
            "available": int(product.get("stock", 0)) > 0,
            "brand": product.get("brandName", ""),
            "license_type": product.get("licenseType", ""),
        }

    async def check_stock(self, product_code: str) -> dict:
        """Check stock for a specific product."""
        price_data = await self.get_price(product_code)
        return {
            "product_code": product_code,
            "name": price_data.get("name", ""),
            "stock": price_data.get("stock", 0),
            "available": price_data.get("available", False),
        }

    # ── Stock (unactivated keys) ───────────────────────────────────────

    async def get_unactivated_stock(self) -> dict:
        """Get all unactivated products and their quantities.

        These are products that have been ordered but not yet activated.
        """
        await self._ensure_login()
        return await self._request("GET", "getStock.json")

    # ── Cart management ────────────────────────────────────────────────

    async def add_to_cart(
        self,
        product_code: str,
        quantity: int = 1,
        users: int | None = None,
        years: int | None = None,
        purchase_type: int = 0,
    ) -> dict:
        """Add a product to the shopping cart.

        ⚠️ Risk Class: 3 (OPERATIONAL_WRITE) — logged, execution allowed.

        Args:
            product_code: DSD product code (e.g. 'DSD110001')
            quantity: number of units
            users: number of users per license (optional)
            years: validity in years (optional)
            purchase_type: 0=new key, 1=renewal key
        """
        await self._ensure_login()
        params: dict[str, Any] = {
            "product_code": product_code,
            "quantity": quantity,
            "purchase_type": purchase_type,
        }
        if users is not None:
            params["users"] = users
        if years is not None:
            params["years"] = years

        logger.info("Adding to cart: %s x%d", product_code, quantity)
        return await self._request("GET", "addToCart.json", params=params)

    async def clear_cart(self) -> dict:
        """Empty the shopping cart."""
        await self._ensure_login()
        return await self._request("GET", "clearCart.json")

    # ── Order placement (Risk Class 4: HIGH_RISK_EXECUTION) ────────────

    async def place_order(
        self,
        product_code: str,
        quantity: int = 1,
        reference: str = "",
        users: int | None = None,
        years: int | None = None,
        purchase_type: int = 0,
    ) -> dict:
        """Place a direct order (without cart).

        ⚠️ Risk Class: 4 (HIGH_RISK_EXECUTION) — MUST go through approval queue!

        Returns order_id on success.
        """
        await self._ensure_login()
        logger.warning(
            "PURCHASE ORDER: product=%s qty=%d ref=%s — requires approval!",
            product_code,
            quantity,
            reference,
        )
        params: dict[str, Any] = {
            "product_code": product_code,
            "quantity": quantity,
            "purchase_type": purchase_type,
        }
        if reference:
            params["reference"] = reference
        if users is not None:
            params["users"] = users
        if years is not None:
            params["years"] = years

        return await self._request("GET", "order.json", params=params)

    async def quick_order(
        self,
        product_code: str,
        email: str,
        quantity: int = 1,
        reference: str = "",
        name: str = "",
        purchase_type: int = 0,
    ) -> dict:
        """Order + activate + send to client — all in one request.

        ⚠️ Risk Class: 4 (HIGH_RISK_EXECUTION) — MUST go through approval queue!

        Returns order_id, certificate_id, and optionally client_id.
        """
        await self._ensure_login()
        logger.warning(
            "QUICK ORDER: product=%s qty=%d email=%s — requires approval!",
            product_code,
            quantity,
            email,
        )
        params: dict[str, Any] = {
            "product_code": product_code,
            "quantity": quantity,
            "email": email,
            "purchase_type": purchase_type,
        }
        if reference:
            params["reference"] = reference
        if name:
            params["name"] = name

        return await self._request("GET", "quickOrder.json", params=params)

    # ── Activation ─────────────────────────────────────────────────────

    async def activate_product(
        self,
        product_code: str,
        quantity: int = 1,
        client_email: str = "",
        client_name: str = "",
        reference: str = "",
    ) -> dict:
        """Activate a product from stock, creating a certificate.

        ⚠️ Risk Class: 4 (HIGH_RISK_EXECUTION) — MUST go through approval queue!
        """
        await self._ensure_login()
        params: dict[str, Any] = {
            "product_code": product_code,
            "quantity": quantity,
        }
        if client_email:
            params["client_email"] = client_email
        if client_name:
            params["client_name"] = client_name
        if reference:
            params["reference"] = reference

        return await self._request("GET", "activateProduct.json", params=params)

    async def get_activation_codes(self, certificate_id: int) -> dict:
        """Get activation codes for a certificate."""
        await self._ensure_login()
        return await self._request(
            "GET", "getActivationCodes.json", params={"certificate_id": certificate_id}
        )

    # ── Client management ──────────────────────────────────────────────

    async def get_clients(self) -> dict:
        """Get all clients for this account."""
        await self._ensure_login()
        return await self._request("GET", "getClients.json")

    async def create_client(self, name: str, email: str, **kwargs: Any) -> dict:
        """Create a new client. Returns client_id."""
        await self._ensure_login()
        data = {"name": name, "email": email, **kwargs}
        return await self._request("POST", "createClient.json", data=data)

    # ── Connection test ────────────────────────────────────────────────

    async def check_connection(self) -> dict:
        """Verify API connectivity and authentication.

        Tries login.json, then falls back to index.json page 1.
        """
        try:
            login_result = await self.login()
            return {"connected": True, "login": login_result}
        except DSDClientError as exc:
            return {
                "connected": False,
                "error": str(exc),
                "status_code": exc.status_code,
            }


# ── Module-level singleton ─────────────────────────────────────────────

_client: DSDClient | None = None


def get_dsd_client() -> DSDClient:
    """Get or create the DSD client singleton.

    Lazy initialization — only creates the client when first needed,
    so missing env vars won't crash the app on startup.
    """
    global _client
    if _client is None:
        _client = DSDClient()
    return _client
