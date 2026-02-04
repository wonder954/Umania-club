import type { Race } from "@/lib/races";
import type { CalendarRace } from "@/types/race";
import { normalizeGrade } from "./groupByDate";

export function racesToCalendarRaces(races: Race[]): CalendarRace[] {
    return races.map(r => {
        const grade = normalizeGrade(r.grade ?? "OP");
        return {
            id: r.id,
            name: r.name,
            date: r.date,
            grade,
            color: getColorFromGrade(grade),
        };
    });
}

function getColorFromGrade(grade: string): string {
    const g = normalizeGrade(grade);

    if (g === "G1") return "bg-blue-500 text-white";
    if (g === "G2") return "bg-red-500 text-white";
    if (g === "G3") return "bg-green-500 text-white";

    return "bg-gray-300 text-gray-800";
}