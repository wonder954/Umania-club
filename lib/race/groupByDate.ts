// import type { Race } from "@/lib/races";
// import type { CalendarRace } from "@/types/race";

// /**
//  * Race[] → CalendarRace[] に変換
//  */
// export function racesToCalendarRaces(races: Race[]): CalendarRace[] {
//     return races.map(r => ({
//         id: r.id,
//         name: r.name,
//         date: r.date,
//         grade: normalizeGrade(r.grade || "OP"),
//         color: getColorFromGrade(r.grade || "OP"), // ★ color を必ず生成
//     }));
// }

// /**
//  * グレード正規化
//  */
// export function normalizeGrade(grade: string): string {
//     return grade
//         .toUpperCase()
//         // 全角ローマ数字 → 半角
//         .replace(/Ⅰ/g, "I")
//         .replace(/Ⅱ/g, "II")
//         .replace(/Ⅲ/g, "III")
//         // アルファベットの III / II / I → 数字
//         .replace(/III/g, "3")
//         .replace(/II/g, "2")
//         .replace(/I/g, "1")
//         // G1, G2, G3 に統一
//         .replace(/G\s*1/, "G1")
//         .replace(/G\s*2/, "G2")
//         .replace(/G\s*3/, "G3");
// }

// /**
//  * グレード → 色
//  */
// function getColorFromGrade(grade: string): string {
//     const g = normalizeGrade(grade).toUpperCase();

//     if (g === "G1" || g === "1") return "bg-blue-500 text-white";   // 青
//     if (g === "G2" || g === "2") return "bg-red-500 text-white";    // 赤
//     if (g === "G3" || g === "3") return "bg-green-500 text-white";  // 緑
//     if (g.startsWith("JG")) return "bg-orange-400 text-white";      // 障害

//     return "bg-gray-300 text-gray-800"; // OP
// }

// /**
//  * 日付ごとにグループ化
//  */
// export function groupByDate(
//     races: CalendarRace[]
// ): Record<string, CalendarRace[]> {
//     const map: Record<string, CalendarRace[]> = {};

//     for (const r of races) {
//         if (!map[r.date]) map[r.date] = [];
//         map[r.date].push(r);
//     }

//     return map;
// }