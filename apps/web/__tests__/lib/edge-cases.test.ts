import { describe, it, expect, vi, beforeEach } from "vitest";

// Inline rate-limit tests for edge cases not covered in rate-limit.test.ts

let rateLimit: typeof import("../../lib/rate-limit").rateLimit;

beforeEach(async () => {
  const mod = await import("../../lib/rate-limit");
  rateLimit = mod.rateLimit;
});

describe("Rate Limiter Edge Cases", () => {
  it("sollte default-Werte nutzen wenn keine Optionen übergeben", () => {
    const ip = "default-test-" + Date.now();
    const result = rateLimit(ip);
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(9); // default maxRequests=10
  });

  it("sollte mit maxRequests=1 sofort blockieren", () => {
    const ip = "one-shot-" + Date.now();
    expect(rateLimit(ip, { maxRequests: 1, windowMs: 60000 }).ok).toBe(true);
    expect(rateLimit(ip, { maxRequests: 1, windowMs: 60000 }).ok).toBe(false);
  });

  it("sollte 'unknown' IP korrekt behandeln", () => {
    const result = rateLimit("unknown", { maxRequests: 3, windowMs: 60000 });
    expect(result.ok).toBe(true);
  });
});

describe("Shuffle Bag Invariants", () => {
  it("sollte das shuffle-bag Modul importieren können", async () => {
    // Can't test with real DB, but verify module structure
    const mod = await import("../../lib/shuffle-bag");
    expect(mod.drawFromShuffleBag).toBeDefined();
    expect(typeof mod.drawFromShuffleBag).toBe("function");
  });
});
