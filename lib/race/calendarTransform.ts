// lib/race/calendarTransform.ts

import type { GradeRace } from "@/lib/grades2026";
import type { RaceViewModel, CalendarRaceVM } from "@/viewmodels/raceViewModel";
import { normalizeRaceName } from "@/utils/race/normalize";
import { normalizeGrade } from "@/utils/race/raceGradeUtils";

// ★ レース同一性判定（normalizeRaceName に一本化）
export function isSameRace(a: string, b: string): boolean {
    const na = normalizeRaceName(a);
    const nb = normalizeRaceName(b);
    return na === nb || na.includes(nb) || nb.includes(na);
}

// ★ 弱いレース（JRA カレンダー）
export function toWeakCalendarRaceVM(j: GradeRace): CalendarRaceVM {
    return {
        id: `jra-${j.id}`,
        date: j.date,
        title: j.name,
        raceName: j.name,
        grade: normalizeGrade(j.grade),
        place: null,
        isPast: false,
        isWeak: true,
    };
}

// ★ 強いレース（スクレイピング済み）
export function toStrongCalendarRaceVM(r: RaceViewModel): CalendarRaceVM {
    return {
        id: r.id,
        date: r.date,
        title: r.titleLabel,
        raceName: r.raceName,
        grade: r.grade,
        place: r.place,
        isPast: !!r.result,
        isWeak: false,
    };
}

// ★ マージ（強いレースを優先）
export function mergeWeakAndStrong(
    weak: CalendarRaceVM[],
    strong: CalendarRaceVM[]
): CalendarRaceVM[] {
    const result = [...strong];

    for (const w of weak) {
        const exists = strong.some(
            (s) =>
                s.date === w.date &&
                isSameRace(s.raceName, w.raceName)
        );

        if (!exists) {
            result.push(w);
        }
    }

    return result;
}

export function groupByDate(
    races: CalendarRaceVM[]
): Record<string, CalendarRaceVM[]> {
    const map: Record<string, CalendarRaceVM[]> = {};

    for (const r of races) {
        if (!map[r.date]) map[r.date] = [];
        map[r.date].push(r);
    }

    return map;
}