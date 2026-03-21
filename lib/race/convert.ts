import type { FirestoreRace, RaceEntry, RaceResult } from "./types";

export function toFirestoreRace(json: any): FirestoreRace {
    const info = json.info ?? {};

    return {
        id: json.raceId,

        // --- 基本情報 ---
        date: info.date ?? "",
        place: info.place ?? "",
        title: info.title ?? "",
        grade: info.grade ?? null,
        distance: info.distance ?? 0,
        surface: info.surface ?? "",
        direction: info.direction ?? null,
        courseDetail: info.courseDetail ?? null,
        weightType: info.weightType ?? null,
        raceNumber: info.raceNumber ?? "",
        placeDetail: info.placeDetail ?? null,
        videoId: info.videoId ?? null,

        // --- 出走馬（フェーズ1〜2） ---
        entries: Array.isArray(json.entries)
            ? json.entries.map((e: any): RaceEntry => ({
                frame: e.frame ?? null,
                number: e.number ?? null,
                name: e.name ?? "",
                sex: e.sex ?? null,
                age: e.age ?? null,
                jockey: e.jockey ?? null,
                weight: e.weight ?? null,
            }))
            : [],

        // --- 結果（フェーズ3） ---
        result: json.result
            ? {
                order: json.result.order ?? [],
                payout: json.result.payout ?? null,
            }
            : null,
    };
}