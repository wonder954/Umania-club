// utils/race/displayName.ts

/** GⅠ/GⅡ/GⅢ をレース名から除去 */
export function removeGradeSuffix(name: string): string {
    return name
        .replace(/\s*(G[ⅠⅡⅢ]|GI|GII|GIII)$/i, "")
        .trim();
}

/** 表示用のレース名整形 */
export function formatRaceName(name: string): string {
    return abbreviateRaceName(removeGradeSuffix(name));
}

/** レース名の略称化（UI表示用） */
export function abbreviateRaceName(name: string): string {
    return name
        .replace("ステークス", "S")
        .replace("カップ", "C")
        .replace("ジャンプ", "J")
        .replace("フィリーズ", "F")
        .replace("ジュベナイル", "J")
        .replace("フューチュリティ", "F")
        .replace("シップ", "S")
        .replace("チャンピオン", "C")
        .replace("トロフィー", "T")
        .replace("ハンデ", "H")
        .replace("サマーダッシュ", "SD")
        .replace("ジョッキークラブ", "JC")
        .replace("グランド", "G")
        .replace("ニュージーランド", "NZ")
        .replace(/（[^）]+）/g, "") // 括弧削除
        .trim();
}
