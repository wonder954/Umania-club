// utils/race/raceGradeUtils.ui.ts

import { normalizeGrade } from "./raceGradeUtils";

export type GradeStyleUI = {
    label: string;
    bg: string;
    text: string;
    border: string;
};

const gradeMapUI: Record<string, GradeStyleUI> = {
    G1: { label: "G1", bg: "bg-blue-900", text: "text-white", border: "border-blue-900" },
    G2: { label: "G2", bg: "bg-red-700", text: "text-white", border: "border-red-700" },
    G3: { label: "G3", bg: "bg-green-700", text: "text-white", border: "border-green-700" },

    JG1: { label: "JG1", bg: "bg-amber-700", text: "text-white", border: "border-amber-700" },
    JG2: { label: "JG2", bg: "bg-amber-600", text: "text-white", border: "border-amber-600" },
    JG3: { label: "JG3", bg: "bg-amber-500", text: "text-white", border: "border-amber-500" },

    OP: { label: "OP", bg: "bg-gray-300", text: "text-gray-800", border: "border-gray-300" },
};

export function getGradeStyleUI(rawGrade: string | null | undefined): GradeStyleUI {
    if (!rawGrade) return gradeMapUI["OP"];

    const g = normalizeGrade(rawGrade);

    return gradeMapUI[g] ?? gradeMapUI["OP"];
}