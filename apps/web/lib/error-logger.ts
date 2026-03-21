/**
 * Structural Error Logger — loggt Fehler als JSON für Vercel Logs.
 * Kein Sentry nötig — Vercel erfasst console.error automatisch.
 */

interface ErrorContext {
  url?: string;
  method?: string;
  userId?: string;
  component?: string;
  [key: string]: unknown;
}

export function logError(error: unknown, context?: ErrorContext): void {
  const entry = {
    level: "error",
    timestamp: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  if (process.env.NODE_ENV === "development") {
    console.error("[ERROR]", entry.message, context);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  } else {
    // In Production: Strukturiertes JSON → Vercel Logs erfasst es
    console.error(JSON.stringify(entry));
  }
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
