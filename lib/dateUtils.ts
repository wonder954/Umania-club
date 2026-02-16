// lib/dateUtils.ts

export const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;

// 土曜を週の開始にする開催週キー
export const getRaceWeekKey = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDay(); // 0:日, 1:月, ..., 6:土

    // 土曜を週の開始にする
    const diffToSaturday = (day + 1) % 7;
    d.setDate(d.getDate() - diffToSaturday);

    return formatDate(d); // 週の開始日（土曜）をキーにする
};

// 前の開催週キー
export const getPreviousWeekKey = (weekKey: string) => {
    const d = new Date(weekKey);
    d.setDate(d.getDate() - 7);
    return formatDate(d);
};