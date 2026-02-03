import grades2026 from "@/scripts/scraper/data/2026_grades.json";

export type GradeRace = {
    id: string;
    name: string;
    grade: string;
    date: string;
};

export const gradeRaces2026: GradeRace[] = grades2026;