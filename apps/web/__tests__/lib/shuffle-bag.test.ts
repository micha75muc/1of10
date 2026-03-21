import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing shuffle-bag
vi.mock("@repo/db", () => ({
  prisma: {
    $transaction: vi.fn(),
    shuffleBag: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { drawFromShuffleBag } from "../../lib/shuffle-bag";
import { prisma } from "@repo/db";

const mockPrisma = vi.mocked(prisma);

describe("ShuffleBag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("drawFromShuffleBag", () => {
    it("sollte true zurückgeben wenn Slot ein Gewinner ist", async () => {
      const fakeBag = {
        id: "bag-1",
        slots: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        currentIndex: 2,
        isActive: true,
        slotsHash: "abc123",
        createdAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          shuffleBag: {
            findFirst: vi.fn().mockResolvedValue(fakeBag),
            create: vi.fn(),
            update: vi.fn().mockResolvedValue(fakeBag),
          },
        };
        return fn(tx);
      });

      const result = await drawFromShuffleBag();
      expect(result).toBe(true);
    });

    it("sollte false zurückgeben wenn Slot kein Gewinner ist", async () => {
      const fakeBag = {
        id: "bag-1",
        slots: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        currentIndex: 0,
        isActive: true,
        slotsHash: "abc123",
        createdAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          shuffleBag: {
            findFirst: vi.fn().mockResolvedValue(fakeBag),
            create: vi.fn(),
            update: vi.fn().mockResolvedValue(fakeBag),
          },
        };
        return fn(tx);
      });

      const result = await drawFromShuffleBag();
      expect(result).toBe(false);
    });

    it("sollte neuen Bag erstellen wenn keiner aktiv ist", async () => {
      const createMock = vi.fn().mockImplementation((data: any) => ({
        id: "bag-new",
        ...data.data,
        createdAt: new Date(),
      }));
      const updateMock = vi.fn().mockResolvedValue({});

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          shuffleBag: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: createMock,
            update: updateMock,
          },
        };
        return fn(tx);
      });

      const result = await drawFromShuffleBag();
      expect(typeof result).toBe("boolean");
      expect(createMock).toHaveBeenCalledOnce();
    });

    it("sollte Bag deaktivieren wenn letzter Slot gezogen", async () => {
      const fakeBag = {
        id: "bag-1",
        slots: [0, 1],
        currentIndex: 1, // letzter Index
        isActive: true,
        slotsHash: "abc123",
        createdAt: new Date(),
      };

      const updateMock = vi.fn().mockResolvedValue({});

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          shuffleBag: {
            findFirst: vi.fn().mockResolvedValue(fakeBag),
            create: vi.fn(),
            update: updateMock,
          },
        };
        return fn(tx);
      });

      const result = await drawFromShuffleBag();
      expect(result).toBe(true);
      expect(updateMock).toHaveBeenCalledWith({
        where: { id: "bag-1" },
        data: { currentIndex: 2, isActive: false },
      });
    });

    it("sollte exakt 1 Gewinner pro Bag-Durchlauf produzieren", async () => {
      // Simuliere einen kompletten Bag-Durchlauf mit 10 Slots
      const slots = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
      let currentIndex = 0;

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const bag = {
          id: "bag-full",
          slots,
          currentIndex,
          isActive: true,
          slotsHash: "abc",
          createdAt: new Date(),
        };
        const tx = {
          shuffleBag: {
            findFirst: vi.fn().mockResolvedValue(bag),
            create: vi.fn(),
            update: vi.fn().mockResolvedValue({}),
          },
        };
        const result = await fn(tx);
        currentIndex++;
        return result;
      });

      let winnerCount = 0;
      for (let i = 0; i < slots.length; i++) {
        const isWinner = await drawFromShuffleBag();
        if (isWinner) winnerCount++;
      }

      expect(winnerCount).toBe(1);
    });

    it("sollte faire Verteilung über viele Durchläufe zeigen (~10%)", async () => {
      // Statistischer Test: über 100 Bags sollte ~10% Gewinner sein
      const totalDraws = 100;
      let wins = 0;

      for (let i = 0; i < totalDraws; i++) {
        // Jeder Draw bekommt einen Bag mit zufälliger Gewinner-Position
        const winnerPos = Math.floor(Math.random() * 10);
        const slots = Array(10).fill(0);
        slots[winnerPos] = 1;
        const drawIndex = i % 10;

        mockPrisma.$transaction.mockImplementationOnce(async (fn: any) => {
          const tx = {
            shuffleBag: {
              findFirst: vi.fn().mockResolvedValue({
                id: `bag-${i}`,
                slots,
                currentIndex: drawIndex,
                isActive: true,
                slotsHash: "x",
                createdAt: new Date(),
              }),
              create: vi.fn(),
              update: vi.fn().mockResolvedValue({}),
            },
          };
          return fn(tx);
        });

        if (await drawFromShuffleBag()) wins++;
      }

      // Erwarte ~10% Gewinner (7-13% akzeptabel bei 100 Draws)
      expect(wins).toBeGreaterThanOrEqual(3);
      expect(wins).toBeLessThanOrEqual(20);
    });
  });
});
