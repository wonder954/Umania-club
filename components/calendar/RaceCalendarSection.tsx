"use client";

import { useState } from "react";
import Link from "next/link";
import { RaceCalendar } from "@/components/calendar/RaceCalendar";
import { racesToCalendarRaces, groupByDate } from "@/lib/race/racesToCalendarRaces";
import { gradeRaces2026 } from "@/lib/grades2026";
import { Modal } from "@/components/common/Modal";
import RaceCard from "@/components/race/RaceCard";

import type { Race } from "@/lib/races";
import type { CalendarRace } from "@/types/race";

export function RaceCalendarSection({
    races,
    holidays,
}: {
    races: Race[];
    holidays: Record<string, string>;
}) {
    const calendarRaces: CalendarRace[] = racesToCalendarRaces(races, gradeRaces2026);
    const racesByDate = groupByDate(calendarRaces);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRaces, setSelectedRaces] = useState<(Race | CalendarRace)[]>([]);

    function handleDayClick(dateStr: string) {
        const dayCalendarRaces = racesByDate[dateStr] ?? [];

        if (dayCalendarRaces.length === 0) return;

        const modalRaces = dayCalendarRaces.map((calRace) => {
            // CalendarRace.id が 10桁 → Race.raceId と一致する可能性
            if (/^\d{10}$/.test(calRace.id)) {
                const fullRace = races.find((r) => r.raceId === calRace.id);
                if (fullRace) return fullRace;
            }
            return calRace;
        });

        setSelectedRaces(modalRaces);
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
                {selectedRaces.map((race) => {
                    const isRaceId = "raceId" in race; // Race かどうか
                    const id = isRaceId ? race.raceId : race.id;

                    const isPast = "result" in race && race.result;

                    const link = isPast
                        ? `/races/${id}/result`
                        : `/races/${id}`;

                    return isRaceId ? (
                        <Link
                            key={id}
                            href={link}
                            className="block mb-4 hover:opacity-90 transition-opacity"
                        >
                            <RaceCard race={race} variant={isPast ? "past" : "upcoming"} />
                        </Link>
                    ) : (
                        <div key={id} className="mb-4">
                            <RaceCard race={race} />
                        </div>
                    );
                })}
            </Modal>
        </>
    );
}