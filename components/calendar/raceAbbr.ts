export const RACE_ABBR: Record<string, string> = {
    "アメリカジョッキークラブカップ": "AJCC",
    "小倉牝馬ステークス": "小倉牝馬S",
    "プロキオンステークス": "プロキオンS",
    "阪神カップ": "阪神C",
    "天皇賞（春）": "天皇賞春",
    "天皇賞（秋）": "天皇賞秋",
};

export function shortenRaceName(name: string) {
    // 1. 完全一致
    if (RACE_ABBR[name]) return RACE_ABBR[name];

    // 2. 部分一致（辞書のキーを含む場合）
    for (const key of Object.keys(RACE_ABBR)) {
        if (name.includes(key)) return RACE_ABBR[key];
    }

    // 3. 一般ルール
    let short = name;
    short = short.replace("ステークス", "S");
    short = short.replace("カップ", "C");
    short = short.replace("ハンデキャップ", "H");
    short = short.replace("ジャンプ", "J");

    return short;
}