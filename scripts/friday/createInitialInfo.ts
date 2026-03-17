// scripts/friday/createInitialInfo.ts
import type { RaceInfo } from "../../lib/race/info";

export function createInitialInfo(race: any): RaceInfo {
    return {
        date: race.date ?? "",
        place: race.place ?? null,
        title: race.title,
        grade: race.grade ?? null,
        surface: race.surface ?? null,
        distance: race.distance ?? null,
        direction: race.direction ?? null,
        courseDetail: race.courseDetail ?? null,
        weightType: race.weightType ?? null,
        raceNumber: null,
        placeDetail: null,
        videoId: null,   // ★ weekly と同じ
    };
}