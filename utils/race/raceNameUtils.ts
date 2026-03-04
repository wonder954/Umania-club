// utils/race/raceNameUtils.ts

/**
 * 重賞レース名の略称辞書
 * 完全一致 → 部分一致 → 一般ルール の順で適用
 */
export const RACE_ABBR: Record<string, string> = {
    "アメリカジョッキークラブカップ": "アメリカJCC",
    "小倉牝馬ステークス": "小倉牝馬S",
    "プロキオンステークス": "プロキオンS",
    "阪神カップ": "阪神C",
    "天皇賞（春）": "天皇賞春",
    "天皇賞（秋）": "天皇賞秋",
};

/**
 * レース名を略称に変換
 * 例: ステークス → S、カップ → C など
 */
export function shortenRaceName(name: string): string {
    // 完全一致
    if (RACE_ABBR[name]) return RACE_ABBR[name];

    // 部分一致
    for (const key of Object.keys(RACE_ABBR)) {
        if (name.includes(key)) return RACE_ABBR[key];
    }

    // 一般ルール
    let short = name;
    short = short.replace("ステークス", "S");
    short = short.replace("カップ", "C");
    short = short.replace("ハンデキャップ", "H");
    short = short.replace("ジャンプ", "J");

    return short;
}


/**
 * レース名の比較用正規化
 * 括弧削除・空白削除・ステークス/S の揺れ吸収など
 */
export function normalizeRaceName(name: string): string {
    return name
        .replace(/（[^）]+）/g, "") // 全角括弧
        .replace(/\([^)]+\)/g, "") // 半角括弧
        .replace(/\s+/g, "")
        .replace(/ステークス|S$/g, "")
        .replace(/カップ|C$/g, "")
        .trim();
}

/** GⅠ/GⅡ/GⅢ をレース名から除去 */
export function removeGradeSuffix(name: string): string {
    return name
        .replace(/\s*(G[ⅠⅡⅢ]|GI|GII|GIII)$/i, "")
        .trim();
}

/**
 * cleanTitle
 * 略称化 → 正規化 をまとめた検索用タイトル
 */
export function cleanTitle(name: string): string {
    return normalizeRaceName(shortenRaceName(name));
}

/**
 * searchKey の生成
 * 形式: 2026_ダイヤモンドS
 */
export function createSearchKey(date: string, name: string): string {
    const year = date.slice(0, 4);
    return `${year}_${cleanTitle(name)}`;
}