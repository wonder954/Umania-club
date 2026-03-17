// lib/raceService.ts

import { groupRaceWeeks, getRaceWeekKey, getThisWeekKey, getPreviousWeekKey } from "./raceWeekUtils";
import { formatDate } from "./dateUtils";
import type { FirestoreRace } from "@/lib/race/types";

export function getWeeklyRaceData(races: FirestoreRace[]) {
    const today = formatDate(new Date());
    const allDates = races.map(r => r.date);

    const weeks = groupRaceWeeks(allDates);
    const thisWeekKey = getThisWeekKey(today, weeks);
    const lastWeekKey = thisWeekKey ? getPreviousWeekKey(thisWeekKey, weeks) : null;

    const upcomingRaces = races
        .filter(r => thisWeekKey && getRaceWeekKey(r.date, weeks) === thisWeekKey)
        .sort((a, b) => a.date.localeCompare(b.date));

    const lastWeekRaces = races
        .filter(r => lastWeekKey && getRaceWeekKey(r.date, weeks) === lastWeekKey)
        .sort((a, b) => a.date.localeCompare(b.date));

    const calendarRaces = races
        .filter(r => r.date < today)
        .sort((a, b) => b.date.localeCompare(a.date));

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