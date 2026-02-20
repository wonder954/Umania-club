import { Race } from "@/lib/races";
import { Mark } from "@/types/mark";

export function getAllowedNumbers(
    prediction: Record<string, Mark>,
    race: Race
): number[] {
    return Object.keys(prediction)
        .map(name => {
            const horse = race.horses.find(h => h.name === name);
            return horse?.number ? Number(horse.number) : null;
        })
        .filter((n): n is number => n !== null && !isNaN(n));
}