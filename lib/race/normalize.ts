import { RaceData } from "./info";
import { FirestoreRace, RaceEntry, RaceResult } from "./types";
import { gradeRaces2026 } from "@/lib/grades2026";
import { normalizeRaceName } from "@/utils/race/normalize"; // ← ここが重要

export function normalizeRace(data: RaceData): FirestoreRace {
    const base = data.info;

    // --- entries の正規化 ---
    let entries: RaceEntry[];

    const hasEntries = Array.isArray(data.entries) && data.entries.length > 0;
    const hasResultOrder = data.result?.order && data.result.order.length > 0;

    if (!hasEntries && hasResultOrder) {
        entries = data.result!.order.map(o => ({
            frame: o.frame ?? null,
            number: o.number ?? null,
            name: o.name.trim(),
            sex: null,
            age: null,
            jockey: o.jockey ?? "",
            weight: o.weight != null ? Number(o.weight) : null,
            odds: o.odds ?? null,
            popular: o.popular ?? null,
        }));
    } else {
        entries = (data.entries ?? []).map(e => ({
            frame: e.frame ?? null,
            number: e.number ?? null,
            name: e.name.trim(),
            sex: e.sex ?? null,
            age: e.age ?? null,
            jockey: e.jockey ?? "",
            weight: e.weight != null ? Number(e.weight) : null,
            odds: e.odds ?? null,
            popular: e.popular ?? null,
        }));
    }

    // --- result の正規化 ---
    const result: RaceResult | null = data.result
        ? {
            order: data.result.order.map(o => ({
                rank: o.rank,
                frame: o.frame,
                number: o.number,
                name: o.name,
                time: o.time ?? null,
                margin: o.margin ?? null,
                jockey: o.jockey ?? "",
                weight: o.weight != null ? Number(o.weight) : null,
                popular: o.popular ?? null,
                odds: o.odds ?? null,
            })),
            payout: data.result.payout ?? null,
        }
        : null;

    // --- JRA の略称 name を grades2026 から探す ---
    const fsNorm = normalizeRaceName(base.title);

    const matched = gradeRaces2026.find(j => {
        const jraNorm = normalizeRaceName(j.name);
        return j.date === base.date && (fsNorm === jraNorm || fsNorm.includes(jraNorm) || jraNorm.includes(fsNorm));
    });

    const officialName = matched?.name ?? null;

    // --- FirestoreRace を返す ---
    return {
        id: data.raceId,
        date: base.date,
        place: base.place ?? "",
        title: base.title,
        name: officialName, // ← ここに略称が入る
        grade: base.grade ?? null,
        distance: base.distance ?? 0,
        surface: base.surface ?? "",
        direction: base.direction ?? null,
        courseDetail: base.courseDetail ?? null,
        weightType: base.weightType ?? null,
        raceNumber: base.raceNumber ?? "",
        placeDetail: base.placeDetail ?? null,
        videoId: base.videoId ?? null,
        entries,
        result,
    };
}