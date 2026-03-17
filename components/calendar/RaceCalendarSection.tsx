"use client";

import { useState } from "react";
import Link from "next/link";
import { RaceCalendar } from "@/components/calendar/RaceCalendar";
import { racesToCalendarRaces, groupByDate } from "@/lib/race/racesToCalendarRaces";
import { Modal } from "@/components/common/Modal";
import { UnifiedRaceCard } from "@/components/race/UnifiedRaceCard";

import type { FirestoreRace } from "@/lib/race/types";
import type { CalendarRace } from "@/components/calendar/types";
import { gradeRaces2026 } from "@/lib/grades2026";

export function RaceCalendarSection({
    races,
    holidays,
}: {
    races: FirestoreRace[];
    holidays: Record<string, string>;
}) {
    // FirestoreRace → CalendarRace に変換
    const calendarRaces: CalendarRace[] = racesToCalendarRaces(races, gradeRaces2026);

    // CalendarRace[] を日付でグループ化
    const racesByDate = groupByDate(calendarRaces);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRaces, setSelectedRaces] = useState<CalendarRace[]>([]);

    function handleDayClick(dateStr: string) {
        const dayRaces = racesByDate[dateStr] ?? [];
        if (dayRaces.length === 0) return;

        setSelectedRaces(dayRaces);
        setModalOpen(true);
    }

    return (
        <>
            <RaceCalendar
                racesByDate={racesByDate}
                holidays={holidays}
                onSelectDate={handleDayClick}
            />

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                {selectedRaces.map((calRace) => {
                    const fullRace = races.find((r) =>
                        r.date === calRace.date &&
                        (r.title === calRace.title ||
                            r.title.includes(calRace.title) ||
                            calRace.title.includes(r.title))
                    );

                    const Card = (
                        <UnifiedRaceCard
                            calRace={calRace}
                            fullRace={fullRace ?? null}
                        />
                    );

                    if (fullRace) {
                        const isPast = !!fullRace.result;
                        const link = isPast
                            ? `/races/${fullRace.id}/result`
                            : `/races/${fullRace.id}`;

                        return (
                            <Link
                                key={`fs-${fullRace.id}`}
                                href={link}
                                className="block mb-4 hover:opacity-90 transition-opacity"
                            >
                                {Card}
                            </Link>
                        );
                    }

                    return (
                        <div key={`jra-${calRace.id}`} className="mb-4">
                            {Card}
                        </div>
                    );
                })}
            </Modal>
        </>
    );
}