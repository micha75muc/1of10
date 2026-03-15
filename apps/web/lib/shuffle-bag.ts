import { randomInt } from "crypto";
import { prisma } from "@repo/db";

const BAG_SIZE = 10;
const WINNERS_PER_BAG = 1;

/**
 * Shuffle Bag ("Murmel-Beutel") — garantiert jeder 10. Kauf eine Erstattung.
 *
 * Funktionsprinzip:
 * 1. Ein Beutel enthält 10 Lose: 1× Gewinner, 9× normal
 * 2. Die Position des Gewinners ist zufällig (kryptografisch sicher)
 * 3. Jeder Kauf zieht das nächste Los
 * 4. Wenn der Beutel leer ist, wird ein neuer erstellt
 */

function createShuffledSlots(): number[] {
  // 10 slots: WINNERS_PER_BAG × 1 (winner), rest × 0 (normal)
  const slots = Array(BAG_SIZE).fill(0);
  for (let i = 0; i < WINNERS_PER_BAG; i++) {
    slots[i] = 1;
  }

  // Fisher-Yates shuffle with crypto randomness
  for (let i = slots.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  return slots;
}

/**
 * Draw from the shuffle bag. Returns true if this purchase gets a refund.
 * Thread-safe via database transaction.
 */
export async function drawFromShuffleBag(): Promise<boolean> {
  return await prisma.$transaction(async (tx) => {
    // Find active bag
    let bag = await tx.shuffleBag.findFirst({
      where: { isActive: true },
    });

    // No active bag → create one
    if (!bag) {
      bag = await tx.shuffleBag.create({
        data: {
          slots: createShuffledSlots(),
          currentIndex: 0,
          isActive: true,
        },
      });
    }

    // Draw current slot
    const isWinner = bag.slots[bag.currentIndex] === 1;
    const nextIndex = bag.currentIndex + 1;

    if (nextIndex >= BAG_SIZE) {
      // Bag is exhausted → mark as inactive, a new one will be created next time
      await tx.shuffleBag.update({
        where: { id: bag.id },
        data: { currentIndex: nextIndex, isActive: false },
      });
    } else {
      // Advance index
      await tx.shuffleBag.update({
        where: { id: bag.id },
        data: { currentIndex: nextIndex },
      });
    }

    return isWinner;
  });
}
