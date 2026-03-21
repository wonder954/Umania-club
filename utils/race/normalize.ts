// utils/race/normalize.ts

import type { FirestoreRace } from "@/lib/race/types";
import type { GradeRace } from "@/lib/grades2026";


/** 検索用の正規化（括弧削除・空白削除・S/C 揺れ吸収） */
export function normalizeRaceName(name: string): string {
    return name
        .replace(/（[^）]+）/g, "")
        .replace(/\([^)]+\)/g, "")
        .replace(/\s+/g, "")
        .replace(/ステークス|S$/g, "")
        .replace(/カップ|C$/g, "")
        .replace(/ジャンプ|J$/g, "")
        .trim();
}

/** cleanTitle（検索用タイトル） */
export function cleanTitle(name: string): string {
    return normalizeRaceName(name);
}

/** searchKey の生成（例: 2026_ダイヤモンドS） */
export function createSearchKey(date: string, name: string): string {
    const year = date.slice(0, 4);
    return `${year}_${cleanTitle(name)}`;
}


/** Firestore のレース名を JRA 名に統一する */
export function unifyRaceTitle(r: FirestoreRace, jra?: GradeRace) {
    return {
        ...r,
        title: jra ? jra.name : r.title,
        grade: jra?.grade ?? r.grade,
    };
}

export function matchJraRace(fsTitle: string, jraName: string): boolean {
    return cleanTitle(fsTitle).includes(cleanTitle(jraName));
}