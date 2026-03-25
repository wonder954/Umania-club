"use client";

import { formatRaceName } from "@/utils/race";
import type { CalendarRaceVM } from "@/viewmodels/raceViewModel";
import Link from "next/link";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";

type Props = {
    day: number | null;
    dateStr: string | null;
    races: CalendarRaceVM[];
    weekday: number;
    isToday: boolean;
    isHoliday: boolean;
    holidayName?: string | null;
    onClick?: () => void;
};

export function CalendarCell({
    day,
    dateStr,
    races,
    weekday,
    isToday,
    isHoliday,
    holidayName,
    onClick,
}: Props) {
    const allRaces: CalendarRaceVM[] = races;

    const bg =
        isHoliday ? "bg-red-50" :
            weekday === 6 ? "bg-red-50" :
                weekday === 5 ? "bg-blue-50" :
                    "";

    const text =
        isHoliday ? "text-red-700 font-bold" :
            weekday === 6 ? "text-red-700 font-bold" :
                weekday === 5 ? "text-blue-700 font-bold" :
                    "";

    const todayStyle = isToday ? "ring-2 ring-green-500 ring-offset-1" : "";

    const todayStr = new Date().toISOString().slice(0, 10);
    const isPast = dateStr ? dateStr < todayStr : false;

    return (
        <div
            className={`border overflow-hidden cursor-pointer hover:bg-gray-50
        min-h-14 sm:min-h-24 h-auto
        p-0.5 sm:p-1
        ${bg} ${todayStyle}`}
            onClick={onClick}
        >
            {/* 日付数字 */}
            {day && (
                <div className={`font-bold text-xs leading-tight ${text}`}>{day}</div>
            )}

            {/* 祝日名：スマホは2文字、PCはフル */}
            {isHoliday && holidayName && (
                <div className="text-[9px] sm:text-[10px] text-red-600 font-bold leading-tight">
                    <span className="sm:hidden">{holidayName.slice(0, 2)}</span>
                    <span className="hidden sm:inline">{holidayName}</span>
                </div>
            )}

            {/* バッジ：縦並び・行間狭く・mt-0で日付に密着 */}
            <div className="flex flex-col gap-y-0 mt-0 leading-tight">                {allRaces.map((race) => {
                const isRaceId = /^\d{10}$/.test(race.id);
                const href = isPast
                    ? `/races/${race.id}/result`
                    : `/races/${race.id}`;
                const style = getGradeStyleUI(race.grade ?? "OP");

                const raceBg = race.isWeak ? `${style.bg}/50` : style.bg;
                const raceText = race.isWeak ? `${style.text}/90` : style.text;


                const fullName = formatRaceName(race.raceName);
                const isWeekend = weekday === 5 || weekday === 6;

                // スマホ用の表示テキスト
                const mobileLabel = isWeekend
                    ? (fullName.length > 4 ? fullName.slice(0, 4) + "…" : fullName) // 土日: 4文字+…
                    : (fullName.length > 4 ? fullName.slice(0, 4) : fullName);      // 平日: 4文字のみ

                const badge = (
                    <span
                        className={`px-1 py-0.5 rounded font-bold hover:opacity-80
                        text-[9px] sm:text-[10px] leading-tight
                        ${raceBg} ${raceText}`}
                    >
                        {/* スマホ: 条件付きラベル / PC: フルネーム */}
                        <span className="sm:hidden">{mobileLabel}</span>
                        <span className="hidden sm:inline">{fullName}</span>
                    </span>
                );


                return isRaceId ? (
                    <Link
                        key={race.id}
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {badge}
                    </Link>
                ) : (
                    <div key={race.id}>{badge}</div>
                );
            })}
            </div>
        </div>
    );
}