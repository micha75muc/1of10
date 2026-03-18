/**
 * Simple in-memory rate limiter (no external dependencies).
 * Uses a sliding window per IP address.
 * Note: Resets on serverless cold start — acceptable for MVP.
 */

const windows = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  ip: string,
  { maxRequests = 10, windowMs = 60_000 } = {}
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = windows.get(ip);

  if (!entry || now > entry.resetAt) {
    windows.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { ok: false, remaining: 0 };
  }

  return { ok: true, remaining: maxRequests - entry.count };
}
