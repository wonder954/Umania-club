// lib/race/groupByDate.ts

import type { Race } from "@/lib/races";
import type { CalendarRace } from "@/types/race";

/**
 * Race[] → CalendarRace[] に変換
 */
export function racesToCalendarRaces(races: Race[]): CalendarRace[] {
    return races.map(r => ({
        id: r.id,
        name: r.name,
        date: r.date,
        grade: normalizeGrade(r.grade || "OP"),
    }));
}

/**
 * グレード正規化
 */
function normalizeGrade(grade: string): string {
    return grade
        .replace(/・/g, "")
        .replace(/[ⅠⅡⅢ]/g, (m) => {
            if (m === "Ⅰ") return "1";
            if (m === "Ⅱ") return "2";
            if (m === "Ⅲ") return "3";
            return m;
        })
        .replace(/[IⅠ](?![IⅠ])/g, "1")  // 単独のI → 1
        .replace(/[IⅠ]{2}(?![IⅠ])/g, "2")  // II → 2
        .replace(/[IⅠ]{3}/g, "3");  // III → 3
}

/**
 * 日付ごとにグループ化
 */
export function groupByDate(races: CalendarRace[]): Record<string, CalendarRace[]> {
    const map: Record<string, CalendarRace[]> = {};

    for (const r of races) {
        if (!map[r.date]) map[r.date] = [];
        map[r.date].push(r);
    }

    return map;
}