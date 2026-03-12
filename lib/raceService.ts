// lib/raceService.ts

import { groupRaceWeeks, getRaceWeekKey, getThisWeekKey, getPreviousWeekKey } from "./raceWeekUtils";
import { formatDate } from "./dateUtils";
import { Race } from "@/lib/races"; // 型があるなら

export function getWeeklyRaceData(races: Race[]) {
    const today = formatDate(new Date());
    const allDates = races.map(r => r.info.date);

    const weeks = groupRaceWeeks(allDates);
    const thisWeekKey = getThisWeekKey(today, weeks);
    const lastWeekKey = thisWeekKey ? getPreviousWeekKey(thisWeekKey, weeks) : null;

    const upcomingRaces = races
        .filter(r => thisWeekKey && getRaceWeekKey(r.info.date, weeks) === thisWeekKey)
        .sort((a, b) => a.info.date.localeCompare(b.info.date));

    const lastWeekRaces = races
        .filter(r => lastWeekKey && getRaceWeekKey(r.info.date, weeks) === lastWeekKey)
        .sort((a, b) => a.info.date.localeCompare(b.info.date));

    const calendarRaces = races
        .filter(r => r.info.date < today)
        .sort((a, b) => b.info.date.localeCompare(a.info.date));

    return {
        today,
        weeks,
        thisWeekKey,
        lastWeekKey,
        upcomingRaces,
        lastWeekRaces,
        calendarRaces,
    };
}