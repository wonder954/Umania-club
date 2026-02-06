import { formatDateWithWeekday } from "@/lib/date";
import type { CalendarRace } from "@/types/race";
import type { Race } from "@/lib/races";
import { getColorFromGrade } from "@/lib/race/racesToCalendarRaces"; // Import helper

type Props = {
    race: CalendarRace | Race;
    variant?: "upcoming" | "past";
};

export default function RaceCard({ race, variant = "upcoming" }: Props) {
    const isPast = variant === "past";

    // Cast to Race to check if detailed data is available
    // (CalendarRace has limited fields, Race has detailed fields)
    const detail = (race as any).course ? (race as Race) : null;

    // Determine color: use existing .color if available, otherwise compute from grade
    const colorClass = (race as CalendarRace).color ?? getColorFromGrade(race.grade ?? "OP");

    // Extract the background color for the border (e.g., "bg-red-500" -> "border-red-500")
    // If no color is defined, fallback to gray/blue default logic.
    const bgClass = colorClass.split(" ").find((c: string) => c.startsWith("bg-"));
    const borderClass = bgClass?.replace("bg-", "border-") || "border-blue-500";
    console.log("RaceCard props.race:", race);

    return (
        <div
            className={`p-6 rounded-xl transition-shadow border-l-4 ${isPast
                ? "bg-gray-100 border-gray-400"
                : `bg-white ${borderClass} hover:shadow-lg`
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded ${colorClass ?? (isPast ? "bg-gray-300 text-gray-700" : "bg-blue-100 text-blue-800")
                            }`}
                    >
                        {race.grade || "OP"}
                    </span>

                    {/* Show place if available (from detailed data) */}
                    {detail && (
                        <p className="text-gray-600 text-sm">
                            {detail.place} / {detail.raceNumber}
                        </p>
                    )}
                </div>

                {/* Date on the right */}
                <span className="text-gray-500 text-sm">
                    {formatDateWithWeekday(race.date)}
                </span>

            </div>
            <h2 className="text-2xl font-bold mb-1 text-gray-800">{race.name}</h2>

            {/* Show simplified info if detail is missing */}
            <p className="text-gray-600 text-sm">
                {detail ? (
                    <>
                        {detail.course.surface} {detail.course.distance}
                        {detail.weightType ? ` / ${detail.weightType}` : ""}
                        {detail.course.courseDetail ? ` / ${detail.course.courseDetail}` : ""}
                    </>
                ) : (
                    <span className="italic text-gray-400">詳細情報なし</span>
                )}
            </p>
        </div>
    );
}