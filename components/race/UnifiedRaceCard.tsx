import { formatRaceName } from "@/utils/race";
import { formatDateWithWeekday } from "@/lib/date";
import type { FirestoreRace } from "@/lib/race/types";
import type { CalendarRace } from "@/components/calendar/types";

export function UnifiedRaceCard({
    calRace,
    fullRace,
}: {
    calRace: CalendarRace;
    fullRace: FirestoreRace | null;
}) {
    const gradeStyle = calRace.color;

    return (
        <div
            className="
                p-6 rounded-2xl transition-shadow border-l-4
                bg-white/70 backdrop-blur-sm shadow-sm border border-white/40
            "
            style={{ borderLeftColor: gradeStyle.border }}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded"
                        style={{
                            backgroundColor: gradeStyle.bg,
                            color: gradeStyle.text,
                        }}
                    >
                        {calRace.grade ?? "OP"}
                    </span>

                    {fullRace?.place && (
                        <p className="text-slate-600 text-sm">
                            {fullRace.place} / {fullRace.raceNumber}
                        </p>
                    )}
                </div>

                <span className="text-slate-500 text-sm">
                    {formatDateWithWeekday(calRace.date)}
                </span>
            </div>

            <h2 className="text-2xl font-bold mb-1 text-slate-800">
                {formatRaceName(calRace.title)}
            </h2>

            {fullRace ? (
                <p className="text-slate-600 text-sm">
                    {fullRace.surface} {fullRace.distance}m
                    {fullRace.weightType ? ` / ${fullRace.weightType}` : ""}
                    {fullRace.courseDetail ? ` / ${fullRace.courseDetail}` : ""}
                </p>
            ) : (
                <p className="text-slate-600 text-sm italic">
                    詳細は開催週に反映されます
                </p>
            )}
        </div>
    );
}