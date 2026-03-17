import type { Entry } from "@/lib/race/info";
import { Mark } from "@/types/mark";

export function getAllowedNumbers(
    prediction: Record<string, Mark>,
    entries: Entry[]
): number[] {
    return Object.keys(prediction)
        .map(name => {
            const horse = entries.find(h => h.name === name);
            return horse?.number ? Number(horse.number) : null;
        })
        .filter((n): n is number => n !== null && !isNaN(n));
}