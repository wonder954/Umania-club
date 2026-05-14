// components/prediction/utils/shortenHorseName.ts

/**
 * 馬名を指定文字数に短縮するユーティリティ
 * - 空白・ドットを除去
 * - 指定文字数でスライス
 *
 * @param name 馬名
 * @param length 取得する文字数（デフォルト3）
 */
export function shortenHorseName(name: string, length: number = 3): string {
    if (!name) return "";

    return name
        .replace(/[\s.]/g, "") // 空白とドットを除去
        .slice(0, length);
}