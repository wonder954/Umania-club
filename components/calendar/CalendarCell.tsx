import { shortenRaceName } from "./raceAbbr";
import type { CalendarRace } from "@/types/race";
import { gradeRaces2026 } from "@/lib/grades2026"; // ★ 追加

type Props = {
    day: number | null;
    dateStr: string | null;
    races: CalendarRace[];
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
    onClick
}: Props) {

    // ★ 2026 重賞をこの日の races に追加
    const gradeRaces =
        dateStr
            ? gradeRaces2026
                .filter(r => r.date === dateStr)
                .map(r => ({
                    id: r.id,
                    name: r.name,
                    grade: r.grade
                        .replace("・", "")
                        .replace("Ⅰ", "1")
                        .replace("Ⅱ", "2")
                        .replace("Ⅲ", "3") as "G1" | "G2" | "G3" | "JG1" | "JG2" | "JG3" | "OP" | "None", // ★ ここ
                    date: r.date,
                }))
            : [];

    function isSameRace(a: CalendarRace, b: CalendarRace) {
        if (!a || !b) return false;
        return (
            a.date === b.date &&
            a.grade === b.grade &&
            a.name.slice(0, 2) === b.name.slice(0, 2)
        );
    }

    const filteredRaces = races.filter(r =>
        !gradeRaces.some(g => isSameRace(g, r))
    );

    // ★ 既存の races と重賞を合体
    const allRaces = [...filteredRaces, ...gradeRaces];


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
                {allRaces.map((race) => (
                    <span
                        key={race.id}
                        className={`
              px-1 py-0.5 rounded text-[10px] font-bold
              ${race.grade === "G1" ? "bg-red-100 text-red-700" : ""}
              ${race.grade === "G2" ? "bg-blue-100 text-blue-700" : ""}
              ${race.grade === "G3" ? "bg-green-100 text-green-700" : ""}
              ${race.grade === "JG1" ? "bg-orange-100 text-orange-700" : ""}
              ${race.grade === "JG2" ? "bg-orange-100 text-orange-700" : ""}
              ${race.grade === "JG3" ? "bg-orange-100 text-orange-700" : ""}
              ${race.grade === "OP" ? "bg-gray-200 text-gray-700" : ""}
            `}
                    >
                        {shortenRaceName(race.name)}
                    </span>
                ))}
            </div>
        </div>
    );
}