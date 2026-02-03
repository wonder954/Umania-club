import type { CalendarRace } from "@/types/race";

export function groupByDate(races: CalendarRace[]) {
    const map: { [date: string]: CalendarRace[] } = {};

    races.forEach(r => {
        if (!map[r.date]) map[r.date] = [];
        map[r.date].push(r);
    });

    return map;
}