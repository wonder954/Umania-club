// utils/race/raceGradeUtils.ts

/**
 * グレード表記の正規化
 * GⅢ → G3、J・GⅢ → JG3 など
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
 * グレード → Tailwind カラー
 */
export function getColorFromGrade(grade: string): string {
    const g = normalizeGrade(grade);

    if (g === "G1" || g === "1") return "bg-blue-500 text-white";
    if (g === "G2" || g === "2") return "bg-red-500 text-white";
    if (g === "G3" || g === "3") return "bg-green-500 text-white";

    if (g.includes("JG")) return "bg-amber-500 text-white";

    return "bg-gray-200 text-gray-800";
}