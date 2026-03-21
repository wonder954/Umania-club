export function formatDateWithWeekday(dateStr: string): string {
    // "2026-02-01" → "20260201" に正規化
    const normalized = dateStr.replace(/-/g, "");

    const year = Number(normalized.slice(0, 4));
    const month = Number(normalized.slice(4, 6)) - 1;
    const day = Number(normalized.slice(6, 8));

    const date = new Date(year, month, day);

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdays[date.getDay()];

    return `${year}年${month + 1}月${day}日（${weekday}）`;
}

export function formatShortDate(dateStr: string): string {
    const normalized = dateStr.replace(/-/g, "");

    const year = Number(normalized.slice(0, 4));
    const month = Number(normalized.slice(4, 6)) - 1;
    const day = Number(normalized.slice(6, 8));

    const date = new Date(year, month, day);

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdays[date.getDay()];

    return `${month + 1}月${day}日(${weekday})`;
}