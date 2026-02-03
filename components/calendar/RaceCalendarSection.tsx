"use client";

import { RaceCalendar } from "@/components/calendar/RaceCalendar";
import type { CalendarRace } from "@/types/race";
import { groupByDate } from "@/lib/race/groupByDate";

export function RaceCalendarSection({
    races,
    holidays,
}: {
    races: CalendarRace[];
    holidays: Record<string, string>;
}) {
    const racesByDate = groupByDate(races);

    return (
        <RaceCalendar
            racesByDate={racesByDate}
            holidays={holidays}
            onSelectDate={(date: string) => {
                console.log("clicked:", date);
            }}
        />
    );
}
