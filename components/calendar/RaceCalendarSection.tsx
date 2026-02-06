// components/calendar/RaceCalendarSection.tsx

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
    // ★ Race[] + JRAデータ → CalendarRace[] に統合
    const calendarRaces: CalendarRace[] = racesToCalendarRaces(races, gradeRaces2026);

    // ★ CalendarRace[] を日付ごとにグループ化
    const racesByDate = groupByDate(calendarRaces);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRaces, setSelectedRaces] = useState<(Race | CalendarRace)[]>([]);

    function handleDayClick(dateStr: string) {
        const dayCalendarRaces = racesByDate[dateStr] ?? [];

        if (dayCalendarRaces.length === 0) return;

        // ★ CalendarRace → Race に変換（詳細データがあれば差し替え）
        const modalRaces = dayCalendarRaces.map(calRace => {
            // raceId が10桁の数字 → races から詳細データを探す
            if (/^\d{10}$/.test(calRace.id)) {
                const fullRace = races.find(r => r.id === calRace.id);
                if (fullRace) {
                    return fullRace; // ★ 詳細版を返す
                }
            }

            // 詳細データがなければ CalendarRace のまま
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
                {selectedRaces.map(race => {
                    const isRaceId = /^\d{10}$/.test(race.id);

                    return isRaceId ? (
                        <Link
                            key={race.id}
                            href={`/races/${race.id}`}
                            className="block mb-4 hover:opacity-90 transition-opacity"
                        >
                            <RaceCard race={race} />
                        </Link>
                    ) : (
                        <div key={race.id} className="mb-4">
                            <RaceCard race={race} />
                        </div>
                    );
                })}
            </Modal>
        </>
    );
}