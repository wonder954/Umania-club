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

    /** ★ 名寄せ用（略称化しない） */
    raceName: string;

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

    const oddsMap = new Map(
        (r.oddsEntries ?? []).map((o) => [o.number, o])
    );

    const mergedEntries: RaceEntryViewModel[] = (r.entries ?? []).map((e) => {
        const odds = oddsMap.get(e.number ?? -1);

        return {
            ...e,
            odds: odds?.odds ?? null,
            popular: odds?.popular ?? null,
        };
    });

    // ★ JRA の JSON の name を最優先で使う
    const shortName = r.name ?? r.title;
    return {
        id: r.id,

        // 生データ
        date: r.date,
        place: r.place,
        raceNumber: r.raceNumber ?? null,
        title: r.title, // 正式名称は保持しておく
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
        titleLabel: formatRaceName(shortName), // UI 用
        raceName: shortName,                   // ← 名寄せ用（略称化しない）
        gradeLabel: grade,

        entries: mergedEntries,
        result: r.result ?? null,
    };
}

export type CalendarRaceVM = {
    id: string;
    date: string;     // YYYY-MM-DD
    title: string;    // 短縮済みタイトル（titleLabel）
    raceName: string;
    grade: string;    // G1/G2/G3
    place: string | null;    // 阪神/中山など
    isPast: boolean;  // result があるかどうか
    isWeak: boolean;
};

export function toCalendarRaceVM(r: RaceViewModel): CalendarRaceVM {
    return {
        id: r.id,
        date: r.date,
        title: r.titleLabel,   // UI 表示用（略称OK）
        raceName: r.raceName,  // ← ここが重要（略称化前の shortName）
        grade: r.grade,
        place: r.place,
        isPast: !!r.result,
        isWeak: false,   // ← スクレイピング済み
    };
}