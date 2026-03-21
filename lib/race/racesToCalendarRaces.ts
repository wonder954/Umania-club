import type { FirestoreRace } from "@/lib/race/types";
import type { GradeRace } from "@/lib/grades2026";
import type { CalendarRace } from "@/components/calendar/types";

import { cleanTitle, unifyRaceTitle } from "@/utils/race/normalize";
import { normalizeGrade, getGradeStyle } from "@/utils/race/raceGradeUtils";
import { removeGradeSuffix } from "@/utils/race/displayName";

function isSameRace(name1: string, name2: string, date1: string, date2: string): boolean {
    if (date1 !== date2) return false;

    const n1 = cleanTitle(name1);
    const n2 = cleanTitle(name2);

    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

export function racesToCalendarRaces(
    races: FirestoreRace[],
    jraData: GradeRace[] = []
): CalendarRace[] {
    const seenIds = new Set<string>();
    const calendarRaces: CalendarRace[] = [];

    // Firestore のレース
    for (const r of races) {
        if (seenIds.has(r.id)) continue;
        seenIds.add(r.id);

        // ★ FirestoreRace と JRA のマッチング
        const jra = jraData.find(j =>
            j.date === r.date &&
            isSameRace(r.title, j.name, r.date, j.date)
        );

        // ★ FirestoreRace を JRA 名に統一
        const unified = unifyRaceTitle(r, jra);

        const grade = normalizeGrade(unified.grade ?? "OP");

        calendarRaces.push({
            id: jra?.id ?? unified.id,                 // JRA ID を優先
            title: unified.title,                      // ← JRA 名に統一済み
            raceName: removeGradeSuffix(unified.title),// ← JRA 名ベース
            date: unified.date,
            grade,
            color: getGradeStyle(grade),
        });
    }

    // JRA データ追加（既存と重複しないものだけ）
    for (const jraRace of jraData) {
        const exists = calendarRaces.some(r =>
            r.id === jraRace.id ||
            isSameRace(r.title, jraRace.name, r.date, jraRace.date)
        );

        if (!exists) {
            const grade = normalizeGrade(jraRace.grade);

            calendarRaces.push({
                id: jraRace.id,
                title: jraRace.name,                       // ← JRA 名
                raceName: removeGradeSuffix(jraRace.name), // ← JRA 名ベース
                date: jraRace.date,
                grade,
                color: getGradeStyle(grade),
                isWeak: true,
            });
        }
    }

    return calendarRaces;
}

export function groupByDate(races: CalendarRace[]): Record<string, CalendarRace[]> {
    const map: Record<string, CalendarRace[]> = {};

    for (const r of races) {
        if (!map[r.date]) map[r.date] = [];
        map[r.date].push(r);
    }

    return map;
}