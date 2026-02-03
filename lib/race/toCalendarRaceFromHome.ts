import type { CalendarRace } from "@/types/race";

type HomeRace = {
    id: string;
    name: string;
    grade?: string;
    date: string;
};

export function toCalendarRaceFromHome(races: HomeRace[]): CalendarRace[] {
    return races.map(r => ({
        id: r.id,
        name: r.name,
        grade: convertGrade(r.grade),
        date: r.date,
    }));
}

function convertGrade(grade?: string): "G1" | "G2" | "G3" | "OP" | "None" {
    switch (grade) {
        case "G1":
        case "GI":
            return "G1";
        case "G2":
        case "GII":
            return "G2";
        case "G3":
        case "GIII":
            return "G3";
        case "OP":
            return "OP";
        default:
            return "None";
    }
}