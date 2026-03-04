// utils/race/displayName.ts

/** GⅠ/GⅡ/GⅢ をレース名から除去 */
export function removeGradeSuffix(name: string): string {
    return name
        .replace(/\s*(G[ⅠⅡⅢ]|GI|GII|GIII)$/i, "")
        .trim();
}

/** 表示用のレース名整形 */
export function formatRaceName(name: string): string {
    return removeGradeSuffix(name);
}