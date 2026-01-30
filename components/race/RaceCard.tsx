import { Race } from "@/lib/races";
import { formatDateWithWeekday } from "@/lib/date";


type Props = {
    race: Race;
    variant?: "upcoming" | "past";
};

export default function RaceCard({ race, variant = "upcoming" }: Props) {
    const isPast = variant === "past";

    return (
        <div
            className={`p-6 rounded-xl transition-shadow border-l-4 ${isPast
                ? "bg-gray-100 border-gray-400"
                : "bg-white border-blue-500 hover:shadow-lg"
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded ${isPast ? "bg-gray-300 text-gray-700" : "bg-blue-100 text-blue-800"
                            }`}
                    >
                        {race.grade}
                    </span>

                    {/* ★ grade のすぐ右に配置 */}
                    <p className="text-gray-600 text-sm">
                        {race.place} / {race.raceNumber}
                    </p>
                </div>

                {/* 日付は右端に */}
                <span className="text-gray-500 text-sm">
                    {formatDateWithWeekday(race.date)}
                </span>

            </div>
            <h2 className="text-2xl font-bold mb-1 text-gray-800">{race.name}</h2>
            <p className="text-gray-600 text-sm">
                {race.course.surface && race.course.distance ? `${race.course.surface} ${race.course.distance}` : "距離情報なし"}
                {race.weightType ? ` / ${race.weightType}` : ""}
                {race.course.courseDetail ? ` / ${race.course.courseDetail}` : ""}
                {/* placeプロパティはRace型に定義されているか確認が必要だが、以前は couseプロパティをplace的に使っていた可能性がある。Race型にはplaceがある。 */}
                {/* 以前のコードでは {race.course} と表示していた。これは "京都" などが入っていた。Race型では race.place がそれに該当するか？ */}
            </p>
        </div>
    );
}