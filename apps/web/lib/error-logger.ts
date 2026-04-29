/**
 * Structural logger — emits JSON to stdout/stderr so Vercel/Hetzner logs
 * are queryable.
 *
 * Three levels mapped to console methods so we don't bring a logging
 * dependency just for this:
 *
 *   logEvent("user.created", { userId })  → console.log
 *   logWarn("payment.retry",  { orderId }) → console.warn
 *   logError(err,             { event })   → console.error
 *
 * In development we keep the raw `[INFO]`/`[WARN]` prefix so it stays
 * readable without piping through `jq`. In production we always emit
 * pure JSON.
 */

interface ErrorContext {
  url?: string;
  method?: string;
  userId?: string;
  component?: string;
  event?: string;
  [key: string]: unknown;
}

type EventContext = Omit<ErrorContext, "url" | "method">;

const isDev = process.env.NODE_ENV === "development";

function emit(
  level: "info" | "warn" | "error",
  payload: Record<string, unknown>,
): void {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  const target =
    level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  if (isDev) {
    target(`[${level.toUpperCase()}]`, entry);
  } else {
    target(JSON.stringify(entry));
  }
}

/** Strukturiertes Info-Logging für Audit-Trail-Events. */
export function logEvent(event: string, context?: EventContext): void {
  emit("info", { event, ...context });
}

/** Strukturiertes Warning-Logging (nicht-tödliche Probleme). */
export function logWarn(event: string, context?: EventContext): void {
  emit("warn", { event, ...context });
}

export function logError(error: unknown, context?: ErrorContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  if (isDev) {
    console.error("[ERROR]", message, context);
    if (stack) console.error(stack);
    return;
  }
  emit("error", { message, stack, ...context });
}

/**
 * Wrapper für API-Route-Handler mit automatischem Error-Logging.
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      logError(error, { url: req.url, method: req.method });
      return new Response(
        JSON.stringify({ error: "Internal Server Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}
