import { describe, it, expect, beforeEach } from "vitest";

// Reset module state between tests by re-importing
let rateLimit: typeof import("../../lib/rate-limit").rateLimit;

beforeEach(async () => {
  // Dynamic import to get fresh module state
  const mod = await import("../../lib/rate-limit");
  rateLimit = mod.rateLimit;
});

describe("Rate Limiter", () => {
  it("sollte erste Anfrage erlauben", () => {
    const result = rateLimit("test-ip-1", { maxRequests: 5, windowMs: 60_000 });
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("sollte nach maxRequests blockieren", () => {
    const ip = "test-ip-block-" + Date.now();
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, { maxRequests: 5, windowMs: 60_000 });
    }
    const result = rateLimit(ip, { maxRequests: 5, windowMs: 60_000 });
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("sollte verschiedene IPs unabhängig behandeln", () => {
    const ip1 = "rate-test-a-" + Date.now();
    const ip2 = "rate-test-b-" + Date.now();
    for (let i = 0; i < 5; i++) {
      rateLimit(ip1, { maxRequests: 5, windowMs: 60_000 });
    }
    const result = rateLimit(ip2, { maxRequests: 5, windowMs: 60_000 });
    expect(result.ok).toBe(true);
  });

  it("sollte remaining korrekt dekrementieren", () => {
    const ip = "rate-decrement-" + Date.now();
    expect(rateLimit(ip, { maxRequests: 3, windowMs: 60_000 }).remaining).toBe(2);
    expect(rateLimit(ip, { maxRequests: 3, windowMs: 60_000 }).remaining).toBe(1);
    expect(rateLimit(ip, { maxRequests: 3, windowMs: 60_000 }).remaining).toBe(0);
    expect(rateLimit(ip, { maxRequests: 3, windowMs: 60_000 }).ok).toBe(false);
  });
});
