import { shortenRaceName } from "./raceAbbr";
import type { CalendarRace } from "@/types/race";
import { gradeRaces2026 } from "@/lib/grades2026";
import Link from "next/link";

type Props = {
    day: number | null;
    dateStr: string | null;
    races: CalendarRace[]; // ★ Race → CalendarRace に統一
    weekday: number;
    isToday: boolean;
    isHoliday: boolean;
    holidayName?: string | null;
    onClick?: () => void;
};

/**
 * レース名の正規化（比較用）
 */
function normalizeRaceName(name: string): string {
    return name
        .replace(/\s+/g, "")
        .replace(/ステークス|S$/g, "")
        .trim();
}

/**
 * グレード → Tailwind クラス（JRA公式カラー）
 */
function getGradeClass(grade?: string): string {
    if (!grade) return "bg-gray-200 text-gray-800";

    const normalized = grade
        .replace(/[ⅠⅡⅢ]/g, (m) => {
            if (m === "Ⅰ") return "I";
            if (m === "Ⅱ") return "II";
            if (m === "Ⅲ") return "III";
            return m;
        })
        .toUpperCase();

    if (normalized.includes("I") && !normalized.includes("II") && !normalized.includes("III")) {
        return "bg-blue-500 text-white";  // GI
    }
    if (normalized.includes("II") && !normalized.includes("III")) {
        return "bg-red-500 text-white";  // GII
    }
    if (normalized.includes("III")) {
        return "bg-green-500 text-white";  // GIII
    }

    return "bg-gray-200 text-gray-800";  // その他
}

export function CalendarCell({
    day,
    dateStr,
    races,
    weekday,
    isToday,
    isHoliday,
    holidayName,
    onClick
}: Props) {

    // ★ 親コンポーネントで既にマージ済みの CalendarRace[] が渡ってくる
    const allRaces: CalendarRace[] = races;

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

    const todayStyle = isToday ? "ring-2 ring-green-500 ring-offset-2" : "";

    return (
        <div
            className={`border h-24 p-1 text-xs overflow-hidden cursor-pointer hover:bg-gray-50 ${bg} ${todayStyle}`}
            onClick={onClick}
        >
            {day && <div className={`font-bold ${text}`}>{day}</div>}

            {isHoliday && holidayName && (
                <div className="text-[10px] text-red-600 font-bold">{holidayName}</div>
            )}

            <div className="flex flex-wrap gap-1 mt-1">
                {allRaces.map((race) => {
                    const isRaceId = /^\d{10}$/.test(race.id);

                    const badge = (
                        <span
                            className={`px-1 py-0.5 rounded text-[10px] font-bold ${race.color} ${!isRaceId ? "opacity-50" : ""
                                } hover:opacity-80`}
                        >
                            {shortenRaceName(race.name)}
                        </span>
                    );

                    return isRaceId ? (
                        <Link
                            key={race.id}
                            href={`/races/${race.id}`}
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