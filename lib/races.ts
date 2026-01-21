import racesData from "@/data/races.json";

export type Race = {
    id: string;
    name: string;
    date: string;
    course: string;
    grade?: string;
    distance?: number;
    track?: string;
    weightType?: string;
    horses: Array<{ number?: number; name: string; jockey?: string }>;
    result: any;
};

export async function getRace(raceId: string) {
    return (racesData as Record<string, Race>)[raceId] || null;
}

export async function getAllRaces() {
    return Object.values(racesData as Record<string, Race>);
}