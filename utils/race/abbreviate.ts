// utils/race/abbreviate.ts

/** 重賞レース名の略称辞書 */
export const RACE_ABBR: Record<string, string> = {
    "アメリカジョッキークラブカップ": "アメリカJCC",
    "小倉牝馬ステークス": "小倉牝馬S",
    "プロキオンステークス": "プロキオンS",
    "阪神カップ": "阪神C",
    "天皇賞（春）": "天皇賞春",
    "天皇賞（秋）": "天皇賞秋",
};

/** 略称化（ステークス→S、カップ→C など） */
export function shortenRaceName(name: string): string {
    if (RACE_ABBR[name]) return RACE_ABBR[name];

    for (const key of Object.keys(RACE_ABBR)) {
        if (name.includes(key)) return RACE_ABBR[key];
    }

    let short = name;
    short = short.replace("ステークス", "S");
    short = short.replace("カップ", "C");
    short = short.replace("ハンデキャップ", "H");
    short = short.replace("ジャンプ", "J");

    return short;
}