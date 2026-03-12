import type { Race } from "@/lib/races";
import type { CalendarRace } from "@/types/race";
import type { GradeRace } from "@/lib/grades2026";

import { cleanTitle } from "@/utils/race/normalize";
import { normalizeGrade, getGradeStyle } from "@/utils/race/raceGradeUtils";
import { removeGradeSuffix } from "@/utils/race/displayName";

/** レース名と日付で同一レースか判定 */
function isSameRace(name1: string, name2: string, date1: string, date2: string): boolean {
    if (date1 !== date2) return false;

    const n1 = cleanTitle(name1);
    const n2 = cleanTitle(name2);

    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

/** Race[] + JRAデータ → CalendarRace[] に変換（重複除去） */
export function racesToCalendarRaces(
    races: Race[],
    jraData: GradeRace[] = []
): CalendarRace[] {
    const seenIds = new Set<string>();
    const calendarRaces: CalendarRace[] = [];

    // 1. Firestore Race データ
    for (const r of races) {
        if (seenIds.has(r.raceId)) continue;
        seenIds.add(r.raceId);

        const grade = normalizeGrade(r.info.grade ?? "OP");

        calendarRaces.push({
            id: r.raceId,
            name: r.info.title,
            raceName: removeGradeSuffix(r.info.title),
            date: r.info.date,
            grade,
            color: getGradeStyle(grade),
            isWeak: false,
        });
    }

    // 2. JRAデータ（重複チェック）
    for (const jraRace of jraData) {
        const exists = calendarRaces.some(r =>
            r.id === jraRace.id ||
            isSameRace(r.name, jraRace.name, r.date, jraRace.date)
        );

        if (!exists) {
            const grade = normalizeGrade(jraRace.grade);

            calendarRaces.push({
                id: jraRace.id,
                name: jraRace.name,
                raceName: removeGradeSuffix(jraRace.name),
                date: jraRace.date,
                grade,
                color: getGradeStyle(grade),
                isWeak: true,
            });
        }
    }

    return calendarRaces;
}

/** 日付ごとにグループ化 */
export function groupByDate(races: CalendarRace[]): Record<string, CalendarRace[]> {
    const map: Record<string, CalendarRace[]> = {};

    for (const r of races) {
        if (!map[r.date]) map[r.date] = [];
        map[r.date].push(r);
    }

    return map;
}