import { formatDateWithWeekday } from "@/lib/date";
import type { CalendarRace } from "@/types/race";
import type { Race } from "@/lib/races";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";
import { formatRaceName } from "@/utils/race";

type Props = {
    race: CalendarRace | Race;
    variant?: "upcoming" | "past";
};

export default function RaceCard({ race, variant = "upcoming" }: Props) {
    const isPast = variant === "past";

    const isFirestoreRace = (race as Race).info !== undefined;

    const info = isFirestoreRace
        ? (race as Race).info
        : {
            // 🔥 CalendarRace は最低限の情報しか持っていない
            grade: (race as CalendarRace).grade ?? null,
            date: (race as CalendarRace).date,
            title: (race as CalendarRace).raceName ?? (race as CalendarRace).name,

            // 🔥 CalendarRace には存在しないので全部 null
            place: null,
            raceNumber: null,
            surface: null,
            distance: null,
            direction: null,
            courseDetail: null,
            weightType: null,
        };

    const style = getGradeStyleUI(info.grade ?? "OP");

    return (
        <div
            className={`
                p-6 rounded-2xl transition-shadow border-l-4
                ${isPast
                    ? "bg-white/50 backdrop-blur-sm border-white/40 shadow-sm"
                    : `bg-white/70 backdrop-blur-sm ${style.border} shadow-sm hover:shadow-md border border-white/40`
                }
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                        {style.label}
                    </span>

                    {info.place && (
                        <p className="text-slate-600 text-sm">
                            {info.place} / {info.raceNumber}
                        </p>
                    )}
                </div>

                <span className="text-slate-500 text-sm">
                    {formatDateWithWeekday(info.date)}
                </span>
            </div>

            <h2 className="text-2xl font-bold mb-1 text-slate-800">
                {formatRaceName(info.title)}
            </h2>

            <p className="text-slate-600 text-sm">
                {info.surface && info.distance ? (
                    <>
                        {info.surface} {info.distance}m
                        {info.weightType ? ` / ${info.weightType}` : ""}
                        {info.courseDetail ? ` / ${info.courseDetail}` : ""}
                    </>
                ) : (
                    <span className="italic text-slate-400">詳細情報なし</span>
                )}
            </p>
        </div>
    );
}