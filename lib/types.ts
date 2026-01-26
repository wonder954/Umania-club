// Race-related types for JRA scraping system

export type RaceSummary = {
    id: string;
    name: string;
    date: string;
    course: string;
    url: string;
    grade: string;
    hasNumbers: boolean;
};

export interface Horse {
    id: string;
    name: string;
    jockey: string;
    frame: number | null;
    number: number | null;
    odds: number | null;
}

export interface RaceDetail {
    id: string;
    name: string;
    grade: string;
    date: string;
    course: string;
    distance: number | null;
    surface: string;
    turn: string;
    hasNumbers: boolean;
    horses: Horse[];
}

// Legacy Race type (keep for compatibility with existing code)
export type Race = {
    id: string;
    name: string;
    date: string;
    course: string;
    raceNumber?: string;
    place?: string;
    grade?: string;
    distance?: number;
    track?: string;
    weightType?: string;
    horses: Array<{ number?: number; name: string; jockey?: string }>;
    result: any;
};
