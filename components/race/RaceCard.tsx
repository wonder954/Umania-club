import { RaceDateLabel } from "@/components/race/RaceDateLabel";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";

type Props = {
    race: RaceViewModel;
    variant?: "upcoming" | "past";
};

export default function RaceCard({ race, variant = "upcoming" }: Props) {
    const isPast = variant === "past";

    const style = getGradeStyleUI(race.grade ?? "OP");

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

                    {race.place && (
                        <p className="text-slate-600 text-sm">
                            {race.place} / {race.raceNumber}
                        </p>
                    )}
                </div>

                <RaceDateLabel date={race.date} />

            </div>

            <h2 className="text-2xl font-bold mb-1 text-slate-800">
                {race.titleLabel}
            </h2>

            <p className="text-slate-600 text-sm">
                {race.surface && race.distance ? (
                    <>
                        {race.surface} {race.distance}m
                        {race.weightType ? ` / ${race.weightType}` : ""}
                        {race.courseDetail ? ` / ${race.courseDetail}` : ""}
                    </>
                ) : (
                    <span className="italic text-slate-400">詳細情報なし</span>
                )}
            </p>
        </div>
    );
}