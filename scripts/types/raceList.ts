export type RaceListItem = {
    raceId: string;
    title: string;
    grade: string | null;
    detailUrl: string;
    surface?: string | null;
    direction?: string | null;
    courseDetail?: string | null;
    distance?: number | null;
    weightType?: string | null;
    date?: string | null;
};

export type LastWeekRaceItem = {
    raceId: string;
    title: string;
    grade: string | null;
    resultUrl: string;
};