export async function fetchHolidays(): Promise<Record<string, string>> {
    const res = await fetch("https://holidays-jp.github.io/api/v1/date.json", {
        next: { revalidate: 60 * 60 * 24 }, // 1日キャッシュ
    });

    if (!res.ok) return {};

    return res.json();
}