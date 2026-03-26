// utils/race/normalize.ts

import type { FirestoreRace } from "@/lib/race/types";
import type { GradeRace } from "@/lib/grades2026";


/** レース名の強力な正規化（JRA 名寄せ用） */
export function normalizeRaceName(name: string): string {
    return name
        .replace(/\(.*?\)/g, "")          // () を除去
        .replace(/（.*?）/g, "")          // 全角（）を除去
        .replace(/[Ａ-Ｚａ-ｚ]/g, (c) =>
            String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
        )                                 // 全角英字 → 半角
        .replace(/\s+/g, "")              // 改行・空白を全部除去
        .replace(/ステークス|S$/g, "")     // ステークス / S を除去
        .replace(/カップ|C$/g, "")        // カップ / C を除去
        .replace(/ジャンプ|J$/g, "")      // ジャンプ / J を除去
        .replace(/第\d+回/g, "")          // 第○回 を除去
        .toLowerCase()
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