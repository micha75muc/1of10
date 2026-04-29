/**
 * Centralised constants — eliminate magic numbers/strings scattered
 * across the codebase. Values that belong here:
 *
 *  - Time-windows for rate-limits, polls, debounces.
 *  - Cross-cutting business rules (max retries, default page sizes).
 *  - Sentinels for sandbox/mock modes (e.g. dummy license-key).
 *
 * NOT here: per-module config (those stay near the user) and secrets
 * (those stay in env vars).
 */

// --- Rate-limit windows ---------------------------------------------------

/** Default rate-limit window for public POST endpoints. */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** Window for the resend-confirmation endpoint (longer to discourage abuse). */
export const RESEND_RATE_LIMIT_WINDOW_MS = 5 * 60_000;
/** Max calls per window for the resend endpoint. */
export const RESEND_RATE_LIMIT_MAX = 3;

// --- Order pending polling -----------------------------------------------

/** How often the order-pending page polls the server. */
export const ORDER_PENDING_POLL_INTERVAL_MS = 3_000;
/** Max poll attempts before showing the timeout state (60 s total). */
export const ORDER_PENDING_MAX_POLLS = 20;

// --- Search / filter ------------------------------------------------------

/** Debounce window before pushing search query into the URL. */
export const SEARCH_DEBOUNCE_MS = 300;

// --- Key delivery (web ↔ agents) -----------------------------------------

/** Hard cap on agents-call duration. Beyond this we surface the error. */
export const KEY_DELIVERY_TIMEOUT_MS = 45_000;

// --- DSD sandbox ---------------------------------------------------------

/**
 * The DSD sandbox returns this dummy key for every successful
 * `quickOrder.json`. Kept centrally so tests + UI can recognise it.
 */
export const SANDBOX_LICENSE_KEY = "XXXX-XXXX-XXXX-XXXX";
