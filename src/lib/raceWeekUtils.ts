// raceWeekUtils.ts

import { formatDate } from "./dateUtils";

/**
 * 開催日を週ごとにグループ化する
 * - 3日以内の連続した日付は同じ開催週
 * - 3日間開催（祝日）や延期（月火）も自然に吸収
 */
export function groupRaceWeeks(allDates: string[]): string[][] {
    const uniqueDates = allDates.filter((d, i, arr) => arr.indexOf(d) === i);
    const sorted = uniqueDates.sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const weeks: string[][] = [];
    let currentWeek: string[] = [];

    for (const date of sorted) {
        if (currentWeek.length === 0) {
            currentWeek.push(date);
        } else {
            const last = currentWeek[currentWeek.length - 1];
            const diff =
                (new Date(date).getTime() - new Date(last).getTime()) /
                (1000 * 60 * 60 * 24);

            if (diff <= 3) {
                // 3日以内 → 同じ開催週（3日間開催・延期をカバー）
                currentWeek.push(date);
            } else {
                // 4日以上空いた → 新しい週
                weeks.push(currentWeek);
                currentWeek = [date];
            }
        }
    }

    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
}

/**
 * 指定した日付が属する開催週の週キー（最初の日）を返す
 */
export function getRaceWeekKey(date: string, weeks: string[][]): string {
    for (const week of weeks) {
        if (week.includes(date)) return week[0];
    }
    return date; // fallback（通常は起きない）
}

/**
 * 今日が属する「今週の開催週キー」を返す
 * - 今日がレース日 → その週
 * - 今日が平日（月〜金）→ 今日以前で最も近い開催週
 * - 今日が未来日（テスト時）→ 今日より後の最初の開催週
 */
export function getThisWeekKey(today: string, weeks: string[][]): string | null {
    // 今日がレース開催日ならその週
    for (const week of weeks) {
        if (week.includes(today)) return week[0];
    }

    // ★ 今日より未来の最初の開催週（平日はこれが今週）
    const futureWeeks = weeks.filter((w) => w[0] > today);
    if (futureWeeks.length > 0) return futureWeeks[0][0];

    // 今日以前で最も近い開催週（データが未来だけの場合）
    const pastWeeks = weeks.filter((w) => w[0] <= today);
    if (pastWeeks.length > 0) return pastWeeks.at(-1)![0];

    return null;
}

/**
 * 前の開催週キーを返す
 */
export function getPreviousWeekKey(
    weekKey: string,
    weeks: string[][]
): string | null {
    const index = weeks.findIndex((w) => w[0] === weekKey);
    if (index <= 0) return null;
    return weeks[index - 1][0];
}