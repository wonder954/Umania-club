import Image from "next/image";
import { formatDateWithWeekday } from "@/lib/date";
import type { FirestoreRace } from "@/lib/race/types";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";
import { formatRaceName } from "@/utils/race";

function parseDistance(raw: any): number | null {
    if (!raw) return null;
    if (typeof raw === "number") return raw;
    const num = parseInt(String(raw).replace(/m/i, "").trim(), 10);
    return Number.isFinite(num) ? num : null;
}

export function RaceHeaderCard({ race }: { race: FirestoreRace }) {
    const style = getGradeStyleUI(race.grade ?? "OP");
    const distance = parseDistance(race.distance);

    return (
        <section
            className={`
                bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-6
                border-l-8 ${style.border}
                border border-white/40
                w-full max-w-4xl mx-auto mt-6
            `}
        >
            <div className="flex flex-col gap-4">

                {/* ロゴ + 日付 */}
                <div className="flex items-center justify-between">
                    <Image
                        src="/umania-club logo.png"
                        alt="Umania-club"
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                    />
                    <span className="text-slate-600 text-sm font-medium">
                        {formatDateWithWeekday(race.date)}
                    </span>
                </div>

                {/* 場所 + R + レース名 */}
                <div className="flex items-start gap-2">
                    <div className="leading-tight text-lg font-bold text-slate-800 min-w-[42px]">
                        <div>{race.place}</div>
                        <div>{race.raceNumber}</div>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                        <h1 className="text-3xl font-extrabold text-slate-900 break-words">
                            {formatRaceName(race.title)}
                        </h1>

                        <span
                            className={`
                                text-2xl font-bold px-2.5 py-1 rounded-lg
                                ${style.bg} ${style.text}
                                shadow-sm
                            `}
                        >
                            {race.grade}
                        </span>
                    </div>
                </div>

                {/* コース情報 */}
                <p className="text-slate-600 font-medium ml-1">
                    {race.surface}{" "}
                    {distance ? `${distance}m` : "距離不明"}
                    {race.direction &&
                        `（${race.direction}${race.courseDetail ? ` ${race.courseDetail}` : ""}）`}
                </p>
            </div>
        </section>
    );
}