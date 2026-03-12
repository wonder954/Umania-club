// lib/dateUtils.ts

// 日付を YYYY-MM-DD にフォーマット
export const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;