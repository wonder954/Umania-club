import { shortenRaceName, formatRaceName } from "@/utils/race";
import type { CalendarRace } from "@/types/race";
import Link from "next/link";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";


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

                    const todayStr = new Date().toISOString().slice(0, 10);
                    const isPast = dateStr ? dateStr < todayStr : false;

                    const href = isPast
                        ? `/races/${race.id}/result`
                        : `/races/${race.id}`;

                    // ★ GradeStyle を取得
                    const style = getGradeStyleUI(race.grade ?? "OP");

                    // ★ デバッグ
                    console.log("race:", race.name, "bg:", style.bg, "text:", style.text, "weak:", race.isWeak);


                    // ★ 薄い色にするかどうか（変数名を変更）
                    const raceBg = race.isWeak ? `${style.bg}/50` : style.bg;
                    const raceText = race.isWeak ? `${style.text}/90` : style.text;

                    const badge = (
                        <span
                            className={`
                px-1 py-0.5 rounded text-[10px] font-bold
                ${raceBg} ${raceText}
                hover:opacity-80
            `}
                        >
                            {shortenRaceName(formatRaceName(race.raceName ?? race.name))}
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