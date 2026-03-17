"use client";

import { useState } from "react";
import Link from "next/link";
import { RaceCalendar } from "@/components/calendar/RaceCalendar";
import { racesToCalendarRaces, groupByDate } from "@/lib/race/racesToCalendarRaces";
import { Modal } from "@/components/common/Modal";
import RaceCard from "@/components/race/RaceCard";

import type { FirestoreRace } from "@/lib/race/types";
import type { CalendarRace } from "@/types/race";
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
                    const id = calRace.id;

                    // FirestoreRace を探す
                    const fullRace = races.find((r) => r.id === id);

                    // FirestoreRace が無い場合は RaceCard を表示しない
                    if (!fullRace) return null;

                    const isPast = !!fullRace.result;

                    const link = isPast
                        ? `/races/${id}/result`
                        : `/races/${id}`;

                    return (
                        <Link
                            key={id}
                            href={link}
                            className="block mb-4 hover:opacity-90 transition-opacity"
                        >
                            <RaceCard race={fullRace} variant={isPast ? "past" : "upcoming"} />
                        </Link>
                    );
                })}
            </Modal>
        </>
    );
}