import data from "../scripts/data/2026_grades_merged.json";

export type GradeRace = {
    id: string;
    name: string;
    grade: string;
    date: string;
};

export const gradeRaces2026: GradeRace[] = data;