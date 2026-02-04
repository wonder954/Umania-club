// components/calendar/CalendarCell.tsx

import { shortenRaceName } from "./raceAbbr";
import type { Race } from "@/lib/races";
import { gradeRaces2026 } from "@/lib/grades2026";
import Link from "next/link";

type Props = {
    day: number | null;
    dateStr: string | null;
    races: Race[];
    weekday: number;
    isToday: boolean;
    isHoliday: boolean;
    holidayName?: string | null;
    onClick?: () => void;
};

/**
 * グレードに応じた背景色クラスを取得
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
        return "bg-red-500 text-white";  // GI
    }
    if (normalized.includes("II") && !normalized.includes("III")) {
        return "bg-blue-500 text-white";  // GII
    }
    if (normalized.includes("III")) {
        return "bg-green-500 text-white";  // GIII
    }

    return "bg-gray-200 text-gray-800";  // その他
}

/**
 * レース名の正規化（比較用）
 */
function normalizeRaceName(name: string): string {
    return name
        .replace(/\s+/g, "")
        .replace(/ステークス|S$/g, "")
        .trim();
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
    // ★ JRA重賞データから該当日のレースを取得
    const jraRaces: Race[] = dateStr
        ? gradeRaces2026
            .filter(r => r.date === dateStr)
            .map(r => ({
                id: r.id,
                name: r.name,
                date: r.date,
                grade: r.grade,
                course: {
                    surface: "",
                    distance: "",
                    direction: "",
                },
                horses: [],
                result: null,
            }))
        : [];

    // ★ Yahoo!スクレイピングデータとJRAデータを合成（重複除去）
    const allRaces: Race[] = [...races];

    for (const jraRace of jraRaces) {
        // 同じレースが既に存在するかチェック
        const exists = allRaces.some(r => {
            const name1 = normalizeRaceName(r.name);
            const name2 = normalizeRaceName(jraRace.name);

            // 日付・グレード・レース名で判定
            return (
                r.date === jraRace.date &&
                (name1 === name2 || name1.includes(name2) || name2.includes(name1))
            );
        });

        if (!exists) {
            allRaces.push(jraRace);
        }
    }

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
                    // raceId が10桁の数字 → スクレイピング済み → リンクあり
                    const isRaceId = /^\d{10}$/.test(race.id);

                    const gradeClass = getGradeClass(race.grade);

                    const badge = (
                        <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${gradeClass} ${!isRaceId ? "opacity-50" : ""}`}>
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