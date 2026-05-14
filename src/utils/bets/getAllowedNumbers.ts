import type { RaceEntry } from '@/src/lib/race/types';
import { Mark } from "@/src/types/mark";

export function getAllowedNumbers(
    prediction: Record<string, Mark>,
    entries: RaceEntry[]
): number[] {
    return Object.keys(prediction)
        .map(name => {
            const horse = entries.find(h => h.name === name);
            return horse?.number ? Number(horse.number) : null;
        })
        .filter((n): n is number => n !== null && !isNaN(n));
}