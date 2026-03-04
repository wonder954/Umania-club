import { formatDateWithWeekday } from "@/lib/date";
import type { CalendarRace } from "@/types/race";
import type { Race } from "@/lib/races";
import { getGradeStyle, type GradeStyle } from "@/utils/race/raceGradeUtils";
import { formatRaceName } from "@/utils/race";

type Props = {
    race: CalendarRace | Race;
    variant?: "upcoming" | "past";
};

export default function RaceCard({ race, variant = "upcoming" }: Props) {
    const isPast = variant === "past";

    const detail = (race as any).course ? (race as Race) : null;

    // ★ CalendarRace.color は GradeStyle に統一されている前提
    const style: GradeStyle =
        (race as CalendarRace).color ??
        getGradeStyle(race.grade ?? "OP");

    const bgClass = style.bg;
    const borderClass = style.border;

    return (
        <div
            className={`
                p-6 rounded-2xl transition-shadow border-l-4 
                ${isPast
                    ? "bg-white/50 backdrop-blur-sm border-white/40 shadow-sm"
                    : `bg-white/70 backdrop-blur-sm ${borderClass} shadow-sm hover:shadow-md border border-white/40`
                }
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span
                        className={`
                            text-xs font-semibold px-2.5 py-0.5 rounded 
                            ${style.bg} ${style.text}
                        `}
                    >
                        {style.label}
                    </span>

                    {detail && (
                        <p className="text-slate-600 text-sm">
                            {detail.place} / {detail.raceNumber}
                        </p>
                    )}
                </div>

                <span className="text-slate-500 text-sm">
                    {formatDateWithWeekday(race.date)}
                </span>
            </div>

            <h2 className="text-2xl font-bold mb-1 text-slate-800">
                {formatRaceName(race.raceName ?? race.name)}
            </h2>

            <p className="text-slate-600 text-sm">
                {detail ? (
                    <>
                        {detail.course.surface} {detail.course.distance}m
                        {detail.weightType ? ` / ${detail.weightType}` : ""}
                        {detail.course.courseDetail ? ` / ${detail.course.courseDetail}` : ""}
                    </>
                ) : (
                    <span className="italic text-slate-400">詳細情報なし</span>
                )}
            </p>
        </div>
    );
}