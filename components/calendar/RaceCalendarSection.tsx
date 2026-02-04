// components/calendar/RaceCalendarSection.tsx

"use client";

import { useState } from "react";
import { RaceCalendar } from "@/components/calendar/RaceCalendar";
import { groupByDate, racesToCalendarRaces } from "@/lib/race/groupByDate";
import { Modal } from "@/components/common/Modal";
import RaceCard from "@/components/race/RaceCard";
import type { Race } from "@/lib/races";

export function RaceCalendarSection({
    races,
    holidays,
}: {
    races: Race[];
    holidays: Record<string, string>;
}) {
    // ★ Race[] → CalendarRace[] に変換
    const calendarRaces = racesToCalendarRaces(races);

    // ★ 日付ごとにグループ化
    const racesByDate = groupByDate(calendarRaces);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRaces, setSelectedRaces] = useState<Race[]>([]);

    function handleDayClick(dateStr: string) {
        // ★ 元の Race[] から抽出（モーダル用）
        const dayRaces = races.filter(r => r.date === dateStr);
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
                {selectedRaces.map(race => (
                    <RaceCard key={race.id} race={race} />
                ))}
            </Modal>
        </>
    );
}