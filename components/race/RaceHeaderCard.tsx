import Image from "next/image";
import { formatDateWithWeekday } from "@/lib/date";
import type { Race } from "@/lib/races";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";
import { formatRaceName } from "@/utils/race";

function parseDistance(raw: any): number | null {
    if (!raw) return null;
    if (typeof raw === "number") return raw;
    const num = parseInt(String(raw).replace(/m/i, "").trim(), 10);
    return Number.isFinite(num) ? num : null;
}

export function RaceHeaderCard({ race }: { race: Race }) {
    const info = race.info;

    const style = getGradeStyleUI(info.grade ?? "OP");
    const distance = parseDistance(info.distance);

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
                        {formatDateWithWeekday(info.date)}
                    </span>
                </div>

                {/* 場所 + R + レース名 */}
                <div className="flex items-start gap-2">
                    <div className="leading-tight text-lg font-bold text-slate-800 min-w-[42px]">
                        <div>{info.place}</div>
                        <div>{info.raceNumber}</div>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                        <h1 className="text-3xl font-extrabold text-slate-900 break-words">
                            {formatRaceName(info.title)}
                        </h1>

                        <span
                            className={`
                                text-2xl font-bold px-2.5 py-1 rounded-lg
                                ${style.bg} ${style.text}
                                shadow-sm
                            `}
                        >
                            {info.grade}
                        </span>
                    </div>
                </div>

                {/* コース情報 */}
                <p className="text-slate-600 font-medium ml-1">
                    {info.surface}{" "}
                    {distance ? `${distance}m` : "距離不明"}
                    {info.direction &&
                        `（${info.direction}${info.courseDetail ? ` ${info.courseDetail}` : ""}）`}
                </p>
            </div>
        </section>
    );
}