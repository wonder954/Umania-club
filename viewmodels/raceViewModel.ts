// viewmodels/raceViewModel.ts

import type { FirestoreRace } from "@/lib/race/types";
import { normalizeGrade } from "@/utils/race/raceGradeUtils";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";
import { formatDate } from "@/lib/dateUtils";
import { formatRaceName } from "@/utils/race/displayName";

// UI が使う最終的な Entry 型
export type RaceEntryViewModel = {
    frame: number | null;
    number: number | null;
    name: string;

    // Firestore と完全一致
    sex: string | null;
    age: number | null;
    jockey: string | null;
    weight: number | null;

    // run-Odds の結果
    odds: number | null;
    popular: number | null;
};

export type RaceViewModel = {
    id: string;

    // Firestore の生データ互換
    date: string;
    place: string;
    raceNumber: string | null;
    title: string;
    grade: string;
    surface: string | null;
    distance: number | null;
    direction: string | null;
    courseDetail: string | null;

    // UI 用の整形データ
    dateLabel: string;
    gradeStyle: {
        bg: string;
        text: string;
        border: string;
    };
    courseLabel: string;
    weightType: string | null;

    // Header 用
    placeLabel: string;
    titleLabel: string;
    gradeLabel: string;

    // ★ 出馬表 + オッズをマージした entries
    entries: RaceEntryViewModel[];

    result: FirestoreRace["result"] | null;
};

export function toRaceViewModel(r: FirestoreRace): RaceViewModel {
    const grade = normalizeGrade(r.grade ?? "");
    const style = getGradeStyleUI(grade);

    const distanceLabel = r.distance ? `${r.distance}m` : "距離不明";
    const course = `${r.surface ?? ""}${distanceLabel}${r.direction
        ? `（${r.direction}${r.courseDetail ? ` ${r.courseDetail}` : ""}）`
        : ""
        }`;

    // ★ oddsEntries を number で検索しやすいように Map 化
    const oddsMap = new Map(
        (r.oddsEntries ?? []).map((o) => [o.number, o])
    );

    // ★ entries と oddsEntries をマージ
    const mergedEntries: RaceEntryViewModel[] = (r.entries ?? []).map((e) => {
        const odds = oddsMap.get(e.number ?? -1);

        return {
            ...e,
            odds: odds?.odds ?? null,
            popular: odds?.popular ?? null,
        };
    });

    return {
        id: r.id,

        // 生データ
        date: r.date,
        place: r.place,
        raceNumber: r.raceNumber ?? null,
        title: r.title,
        grade,
        surface: r.surface ?? null,
        distance: r.distance ?? null,
        direction: r.direction ?? null,
        courseDetail: r.courseDetail ?? null,

        // 整形データ
        dateLabel: formatDate(new Date(r.date)),
        gradeStyle: style,
        courseLabel: course,
        weightType: r.weightType ?? null,

        // Header 用
        placeLabel: r.place,
        titleLabel: formatRaceName(r.title),
        gradeLabel: grade,

        // ★ マージ済み entries
        entries: mergedEntries,

        result: r.result ?? null,
    };
}