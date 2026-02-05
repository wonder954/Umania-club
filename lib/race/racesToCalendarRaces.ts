import type { Race } from "@/lib/races";
import type { CalendarRace } from "@/types/race";
import { normalizeGrade } from "./groupByDate";
import type { GradeRace } from "@/lib/grades2026";

export function racesToCalendarRaces(races: Race[], dates: GradeRace[] = []): CalendarRace[] {
    // 1. Convert scraped races to CalendarRace
    // Also filter duplicates if any scraped races share ID (unlikely but safe)
    const seenIds = new Set<string>();
    const calendarRaces: CalendarRace[] = [];

    for (const r of races) {
        if (seenIds.has(r.id)) continue;
        seenIds.add(r.id);

        const grade = normalizeGrade(r.grade ?? "OP");
        calendarRaces.push({
            id: r.id,
            name: r.name,
            date: r.date,
            grade,
            color: getColorFromGrade(grade),
        });
    }

    // 2. Merge JRA Grade Races (that are not in scraped rases)
    for (const jraRace of dates) {
        // Check if this race already exists in scraped data
        const exists = calendarRaces.some(r => {
            return (r.id === jraRace.id) || isSameRace(r.name, jraRace.name, r.date, jraRace.date);
        });

        if (!exists) {
            calendarRaces.push({
                id: jraRace.id,
                name: jraRace.name,
                date: jraRace.date,
                grade: jraRace.grade,
                color: getColorFromGrade(jraRace.grade), // Use unified color logic
            });
        }
    }

    return calendarRaces;
}

export function getColorFromGrade(grade: string): string {
    const g = normalizeGrade(grade);

    if (g === "GI" || g === "G1") return "bg-blue-500 text-white";
    if (g === "GII" || g === "G2") return "bg-red-500 text-white";
    if (g === "GIII" || g === "G3") return "bg-green-500 text-white";

    // Jump races (JG1, JG2, JG3, J・G1 etc)
    if (g.includes("JG") || g.includes("J・G") || g.includes("J.G")) {
        return "bg-amber-500 text-white";
    }

    return "bg-gray-200 text-gray-800";
}

/**
 * Compare race names (normalize width, remove spaces, etc)
 */
function isSameRace(name1: string, name2: string, date1: string, date2: string): boolean {
    if (date1 !== date2) return false;

    const n1 = normalizeRaceName(name1);
    const n2 = normalizeRaceName(name2);

    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

function normalizeRaceName(name: string): string {
    return name
        .replace(/\s+/g, "")
        .replace(/ステークス|S$/g, "")
        .trim();
}