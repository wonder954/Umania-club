// viewmodels/raceViewModel.ts

import type { FirestoreRace } from "@/lib/race/types";
import { normalizeGrade } from "@/utils/race/raceGradeUtils";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";
import { formatDate } from "@/lib/dateUtils";

export type RaceViewModel = {
    id: string;

    // UI が必要とする生データ互換
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


    // RaceHeaderCard が必要とする追加ラベル
    placeLabel: string;
    titleLabel: string;
    gradeLabel: string;

    entries: FirestoreRace["entries"];

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

    return {
        id: r.id,

        // 生データ互換（UI がそのまま使える）
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


        // RaceHeaderCard 用
        placeLabel: r.place,     // ← 改行のため place と raceNumber を分けて保持
        titleLabel: r.title,
        gradeLabel: grade,

        entries: r.entries,

        result: r.result ?? null,
    };
}