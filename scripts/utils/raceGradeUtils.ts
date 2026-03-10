/** グレード表記の正規化 */
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

export type GradeStyle = {
    label: string;
    bg: string;
    text: string;
    border: string;
};

const gradeMap: Record<string, GradeStyle> = {
    G1: { label: "G1", bg: "#1e40af", text: "#ffffff", border: "#1e40af" },
    G2: { label: "G2", bg: "#b91c1c", text: "#ffffff", border: "#b91c1c" },
    G3: { label: "G3", bg: "#166534", text: "#ffffff", border: "#166534" },

    JG1: { label: "JG1", bg: "#b45309", text: "#ffffff", border: "#b45309" },
    JG2: { label: "JG2", bg: "#d97706", text: "#ffffff", border: "#d97706" },
    JG3: { label: "JG3", bg: "#f59e0b", text: "#ffffff", border: "#f59e0b" },

    OP: { label: "OP", bg: "#d1d5db", text: "#1f2937", border: "#d1d5db" },
};

export function getGradeStyle(rawGrade: string | null | undefined): GradeStyle {
    if (!rawGrade) return gradeMap["OP"];

    const g = normalizeGrade(rawGrade);

    if (g.startsWith("JG")) {
        return gradeMap[g] ?? gradeMap["OP"];
    }

    if (["G1", "G2", "G3"].includes(g)) {
        return gradeMap[g];
    }

    return gradeMap["OP"];
}