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
        .replace(/\s+/g, "");
}

/**
 * グレードの UI スタイル
 */
export type GradeStyle = {
    label: string;   // 表示名（G1 / JG1 など）
    bg: string;      // 背景色
    text: string;    // 文字色
    border: string;  // 枠線色
};

/**
 * グレード → Tailwind カラー
 * JRA（G1/G2/G3）＋ 障害（JG1/JG2/JG3）
 */
const gradeMap: Record<string, GradeStyle> = {
    G1: { label: "G1", bg: "bg-blue-500", text: "text-white", border: "border-blue-500" },
    G2: { label: "G2", bg: "bg-red-500", text: "text-white", border: "border-red-500" },
    G3: { label: "G3", bg: "bg-green-500", text: "text-white", border: "border-green-500" },

    JG1: { label: "JG1", bg: "bg-amber-600", text: "text-white", border: "border-amber-600" },
    JG2: { label: "JG2", bg: "bg-amber-500", text: "text-white", border: "border-amber-500" },
    JG3: { label: "JG3", bg: "bg-amber-400", text: "text-white", border: "border-amber-400" },

    OP: { label: "OP", bg: "bg-gray-300", text: "text-gray-800", border: "border-gray-300" },
};

/**
 * グレードに応じたスタイルを返す
 */
export function getGradeStyle(rawGrade: string | null | undefined): GradeStyle {
    if (!rawGrade) return gradeMap["OP"];

    const g = normalizeGrade(rawGrade);

    // JG1/JG2/JG3
    if (g.startsWith("JG")) {
        return gradeMap[g] ?? gradeMap["OP"];
    }

    // G1/G2/G3
    if (["G1", "G2", "G3"].includes(g)) {
        return gradeMap[g];
    }

    return gradeMap["OP"];
}