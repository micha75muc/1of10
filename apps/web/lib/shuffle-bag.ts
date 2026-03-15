import { randomInt, createHash } from "crypto";
import { prisma } from "@repo/db";

const BAG_SIZE_MIN = 7;
const BAG_SIZE_MAX = 13;
const WINNERS_PER_BAG = 1;

/**
 * Shuffle Bag ("Murmel-Beutel") — erstattet ca. jeden 10. Kauf.
 *
 * Funktionsprinzip:
 * 1. Ein Beutel enthält 7-13 Lose (variabel, Durchschnitt 10): 1× Erstattung, Rest normal
 * 2. Die Position ist zufällig (kryptografisch sicher)
 * 3. Variable Größe verhindert, dass Bots den Erstattungs-Slot vorhersagen
 * 4. SHA-256 Hash bei Erstellung für Audit-Trail (Provably Fair)
 */

function createShuffledSlots(): number[] {
  const bagSize = randomInt(BAG_SIZE_MIN, BAG_SIZE_MAX + 1);
  const slots = Array(bagSize).fill(0);
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

function hashSlots(slots: number[]): string {
  return createHash("sha256").update(JSON.stringify(slots)).digest("hex");
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

    // No active bag → create one with hash
    if (!bag) {
      const slots = createShuffledSlots();
      bag = await tx.shuffleBag.create({
        data: {
          slots,
          currentIndex: 0,
          isActive: true,
          slotsHash: hashSlots(slots),
        },
      });
    }

    // Draw current slot
    const isWinner = bag.slots[bag.currentIndex] === 1;
    const nextIndex = bag.currentIndex + 1;

    if (nextIndex >= bag.slots.length) {
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
