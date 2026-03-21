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
        .replace("記念", "記")
        .replace("ジャンプ", "J")
        .replace(/（[^）]+）/g, "") // 括弧削除
        .trim();
}
