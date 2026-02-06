// lib/race/racesToCalendarRaces.ts

import type { Race } from "@/lib/races";
import type { CalendarRace } from "@/types/race";
import type { GradeRace } from "@/lib/grades2026";

/**
 * グレード正規化
 */
export function normalizeGrade(grade: string): string {
    return grade
        .toUpperCase()
        .replace(/Ⅰ/g, "I")
        .replace(/Ⅱ/g, "II")
        .replace(/Ⅲ/g, "III")
        .replace(/・/g, "")
        .replace(/III/g, "3")
        .replace(/II/g, "2")
        .replace(/(?<![I0-9])I(?![I0-9])/g, "1")
        .replace(/\s+/g, "")
        .replace(/G1/, "G1")
        .replace(/G2/, "G2")
        .replace(/G3/, "G3");
}

/**
 * グレード → 色
 */
export function getColorFromGrade(grade: string): string {
    const g = normalizeGrade(grade);

    if (g === "G1" || g === "1") return "bg-blue-500 text-white";
    if (g === "G2" || g === "2") return "bg-red-500 text-white";
    if (g === "G3" || g === "3") return "bg-green-500 text-white";

    if (g.includes("JG") || g.includes("J・G") || g.includes("J.G")) {
        return "bg-amber-500 text-white";
    }

    return "bg-gray-200 text-gray-800";
}

/**
 * レース名の正規化（比較用）
 */
function normalizeRaceName(name: string): string {
    return name
        .replace(/（[^）]+）/g, "")
        .replace(/\([^)]+\)/g, "")
        .replace(/\s+/g, "")
        .replace(/ステークス|S$/g, "")
        .replace(/カップ|C$/g, "")
        .trim();
}

/**
 * レース名と日付で同一レースか判定
 */
function isSameRace(name1: string, name2: string, date1: string, date2: string): boolean {
    if (date1 !== date2) return false;

    const n1 = normalizeRaceName(name1);
    const n2 = normalizeRaceName(name2);

    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

/**
 * Race[] + JRAデータ → CalendarRace[] に変換（重複除去）
 */
export function racesToCalendarRaces(races: Race[], jraData: GradeRace[] = []): CalendarRace[] {
    const seenIds = new Set<string>();
    const calendarRaces: CalendarRace[] = [];

    // 1. Yahoo!スクレイピングデータを追加
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

    // 2. JRAデータを追加（重複チェック付き）
    for (const jraRace of jraData) {
        const exists = calendarRaces.some(r => {
            return (
                r.id === jraRace.id ||
                isSameRace(r.name, jraRace.name, r.date, jraRace.date)
            );
        });

        if (!exists) {
            const grade = normalizeGrade(jraRace.grade);
            calendarRaces.push({
                id: jraRace.id,
                name: jraRace.name,
                date: jraRace.date,
                grade,
                color: getColorFromGrade(grade),
            });
        }
    }

    return calendarRaces;
}

/**
 * 日付ごとにグループ化
 */
export function groupByDate(races: CalendarRace[]): Record<string, CalendarRace[]> {
    // ★ export を追加 ^^^
    const map: Record<string, CalendarRace[]> = {};

    for (const r of races) {
        if (!map[r.date]) map[r.date] = [];
        map[r.date].push(r);
    }

    return map;
}