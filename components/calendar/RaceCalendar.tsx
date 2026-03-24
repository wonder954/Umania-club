"use client";

import { useState } from "react";
import { getCalendarMatrix } from "./calendarMatrix";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarCell } from "./CalendarCell";

import type { CalendarRace } from "@/components/calendar/types";

export type RacesByDate = {
    [date: string]: CalendarRace[];
};

type RaceCalendarProps = {
    racesByDate: RacesByDate;
    holidays: Record<string, string>;
    onSelectDate?: (date: string) => void;
};

// 土日列を2fr、月〜金列を1frにするカスタムグリッド
const GRID_COLS = "1fr 1fr 1fr 1fr 1fr 2fr 2fr";

export function RaceCalendar({ racesByDate, holidays, onSelectDate }: RaceCalendarProps) {
    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const isToday = (d: number | null) => {
        if (!d) return false;
        return (
            year === today.getFullYear() &&
            month === today.getMonth() &&
            d === today.getDate()
        );
    };

    const matrix = getCalendarMatrix(year, month);

    function changeMonth(diff: number) {
        const newDate = new Date(year, month + diff, 1);
        setYear(newDate.getFullYear());
        setMonth(newDate.getMonth());
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            <CalendarHeader year={year} month={month} changeMonth={changeMonth} />

            {/* 曜日ヘッダー */}
            <div
                className="grid gap-1"
                style={{ gridTemplateColumns: GRID_COLS }}
            >
                {["月", "火", "水", "木", "金", "土", "日"].map((d, i) => (
                    <div
                        key={d}
                        className={`text-center font-bold text-sm py-1 ${i === 5 ? "text-red-600" :
                                i === 6 ? "text-red-600" : ""
                            }`}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* 日付セル */}
            <div
                className="grid gap-1"
                style={{ gridTemplateColumns: GRID_COLS }}
            >
                {matrix.map((week, wi) =>
                    week.map((day, di) => {
                        const dateKey =
                            day
                                ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                                : null;

                        const races = dateKey ? racesByDate[dateKey] ?? [] : [];

                        const isHoliday = dateKey ? holidays[dateKey] !== undefined : false;
                        const holidayName = dateKey ? holidays[dateKey] ?? null : null;

                        return (
                            <CalendarCell
                                key={`${wi}-${di}`}
                                day={day}
                                dateStr={dateKey}
                                races={races}
                                weekday={di}
                                isToday={isToday(day)}
                                isHoliday={isHoliday}
                                holidayName={holidayName}
                                onClick={() => {
                                    if (!day || !dateKey) return;
                                    onSelectDate?.(dateKey);
                                }}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}