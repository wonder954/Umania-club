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
        color: getColorFromGrade(r.grade || "OP"), // ★ color を必ず生成
    }));
}

/**
 * グレード正規化
 */
export function normalizeGrade(grade: string): string {
    return grade
        .replace(/・/g, "")
        .replace(/[ⅠⅡⅢ]/g, (m) => {
            if (m === "Ⅰ") return "1";
            if (m === "Ⅱ") return "2";
            if (m === "Ⅲ") return "3";
            return m;
        })
        .replace(/[IⅠ](?![IⅠ])/g, "1")
        .replace(/[IⅠ]{2}(?![IⅠ])/g, "2")
        .replace(/[IⅠ]{3}/g, "3");
}

/**
 * グレード → 色
 */
function getColorFromGrade(grade: string): string {
    const g = normalizeGrade(grade).toUpperCase();

    if (g === "G1" || g === "1") return "bg-blue-500 text-white";   // 青
    if (g === "G2" || g === "2") return "bg-red-500 text-white";    // 赤
    if (g === "G3" || g === "3") return "bg-green-500 text-white";  // 緑
    if (g.startsWith("JG")) return "bg-orange-400 text-white";      // 障害

    return "bg-gray-300 text-gray-800"; // OP
}

/**
 * 日付ごとにグループ化
 */
export function groupByDate(
    races: CalendarRace[]
): Record<string, CalendarRace[]> {
    const map: Record<string, CalendarRace[]> = {};

    for (const r of races) {
        if (!map[r.date]) map[r.date] = [];
        map[r.date].push(r);
    }

    return map;
}