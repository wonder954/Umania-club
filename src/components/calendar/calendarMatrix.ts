export function getCalendarMatrix(year: number, month: number): (number | null)[][] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = (firstDay.getDay() + 6) % 7;

    const days: (number | null)[] = [];

    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    while (days.length < 42) days.push(null);

    const matrix = [];
    for (let i = 0; i < 6; i++) {
        matrix.push(days.slice(i * 7, i * 7 + 7));
    }

    return matrix;
}