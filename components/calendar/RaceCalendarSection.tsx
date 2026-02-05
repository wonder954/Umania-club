"use client";

import { useState } from "react";
import Link from "next/link";
import { RaceCalendar } from "@/components/calendar/RaceCalendar";

// ★ CalendarRace 用の変換 & グループ化
import { racesToCalendarRaces } from "@/lib/race/racesToCalendarRaces";
import { groupByDate as groupCalendarRaces } from "@/lib/race/groupByDate";
import { gradeRaces2026 } from "@/lib/grades2026"; // Import JRA Data

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
    // ★ Race[] + JRA Data → Unified CalendarRace[]
    const calendarRaces: CalendarRace[] = racesToCalendarRaces(races, gradeRaces2026);

    // ★ CalendarRace[] を日付ごとにグループ化（UI 用）
    const racesByDate = groupCalendarRaces(calendarRaces);

    // ★ モーダルは Race[] または CalendarRace[] を使う
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRaces, setSelectedRaces] = useState<(Race | CalendarRace)[]>([]);

    function handleDayClick(dateStr: string) {
        const dayCalendarRaces = racesByDate[dateStr] ?? [];

        if (dayCalendarRaces.length === 0) {
            return;
        }

        // ★ Yahoo! Race (詳細あり) を優先して取得、なければ CalendarRace (簡易) を使用
        // UI上は merged された dayCalendarRaces がすべて表示されているので、
        // モーダルでもそれらをすべて表示すべき。

        // 1. まずその日の詳細データ(Race)を探す
        const fullRaces = races.filter(r => r.date === dateStr);

        // 2. 詳細データがないレース（JRAのみ）を特定してマージする
        //    (racesToCalendarRaces でマージ済みなので、dayCalendarRaces をベースにするのが確実)

        const modalRaces = dayCalendarRaces.map(calRace => {
            // IDが10桁（スクレイピング済み）なら fullRaces から探す
            if (/^\d{10}$/.test(calRace.id)) {
                return fullRaces.find(r => r.id === calRace.id) || calRace;
            }
            // そうでなければ CalendarRace のまま
            return calRace;
        });

        setSelectedRaces(modalRaces);
        setModalOpen(true);
    }

    return (
        <>
            <RaceCalendar
                racesByDate={racesByDate} // CalendarRace 用
                holidays={holidays}
                onSelectDate={handleDayClick}
            />

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                {selectedRaces.map(race => {
                    const isRaceId = /^\d{10}$/.test(race.id);
                    return isRaceId ? (
                        <Link key={race.id} href={`/races/${race.id}`} className="block mb-4 hover:opacity-90 transition-opacity">
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