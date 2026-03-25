"use client";

import { useState } from "react";
import Link from "next/link";
import { RaceCalendar } from "@/components/calendar/RaceCalendar";
import { groupByDate } from "@/lib/race/calendarTransform";
import { Modal } from "@/components/common/Modal";
import { UnifiedRaceCard } from "@/components/race/UnifiedRaceCard";

import type { RaceViewModel, CalendarRaceVM } from "@/viewmodels/raceViewModel";
import {
    toWeakCalendarRaceVM,
    toStrongCalendarRaceVM,
    mergeWeakAndStrong,
} from "@/lib/race/calendarTransform";
import { gradeRaces2026 } from "@/lib/grades2026";

export function RaceCalendarSection({
    races,      // ← FirestoreRace ではなく RaceViewModel[]
    holidays,
}: {
    races: RaceViewModel[];
    holidays: Record<string, string>;
}) {
    // 強いレース
    const strong = races.map(toStrongCalendarRaceVM);

    // 弱いレース（JRA カレンダー）
    const weak = gradeRaces2026.map(toWeakCalendarRaceVM);

    // マージ
    const calendarRaces = mergeWeakAndStrong(weak, strong);


    // ★ 日付でグループ化
    const racesByDate = groupByDate(calendarRaces);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRaces, setSelectedRaces] = useState<CalendarRaceVM[]>([]);

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
                    // ★ Firestore の詳細データを探す
                    const fullRace = races.find((r) => r.id === calRace.id) ?? null;

                    const link = fullRace
                        ? fullRace.result
                            ? `/races/${fullRace.id}/result`
                            : `/races/${fullRace.id}`
                        : undefined;

                    return link ? (
                        <Link
                            key={calRace.id}
                            href={link}
                            className="block mb-4 hover:opacity-90 transition-opacity"
                        >
                            <UnifiedRaceCard calRace={calRace} fullRace={fullRace} />
                        </Link>
                    ) : (
                        <UnifiedRaceCard
                            key={calRace.id}
                            calRace={calRace}
                            fullRace={null}
                        />
                    );
                })}
            </Modal>
        </>
    );
}