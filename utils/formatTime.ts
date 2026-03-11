export function formatRelativeTime(date: Date) {
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // 秒差

    if (diff < 60) return "たった今";
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}日前`;

    // 1週間以上前は日付表示
    return date.toLocaleDateString("ja-JP");
}