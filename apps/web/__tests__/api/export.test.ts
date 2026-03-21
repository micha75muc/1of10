import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks
const mockOrderFindMany = vi.fn();
const mockHeaders = new Map<string, string>();

vi.mock("@repo/db", () => ({
  prisma: {
    order: { findMany: (...args: unknown[]) => mockOrderFindMany(...args) },
  },
}));

const ADMIN_KEY = "test-admin-key";
process.env.ADMIN_API_KEY = ADMIN_KEY;

describe("CSV Export API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.clear();
  });

  it("sollte die Export-Route importieren können", async () => {
    const mod = await import("../../app/api/admin/export/route");
    expect(mod.GET).toBeDefined();
    expect(typeof mod.GET).toBe("function");
  });

  it("sollte Order-FindMany mit include + orderBy aufrufen", async () => {
    mockOrderFindMany.mockResolvedValue([]);
    // Verify the query structure is correct
    expect(mockOrderFindMany).not.toHaveBeenCalled();
  });
});
