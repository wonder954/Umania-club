import Image from "next/image";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";
import { RaceDateLabel } from "@/components/race/RaceDateLabel";

export function RaceHeaderCard({ race }: { race: RaceViewModel }) {
    return (
        <section
            className={`
                bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-6
                border-l-8 ${race.gradeStyle.border}
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

                    <RaceDateLabel date={race.date} />

                </div>

                {/* 場所 + R + レース名 */}
                <div className="flex items-start gap-2">
                    <div className="inline-flex flex-col items-center leading-tight text-lg font-bold text-slate-800">
                        <div>{race.place}</div>
                        <div>{race.raceNumber}</div>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                        <h1
                            className="
    text-2xl font-extrabold text-slate-900
    tracking-tight leading-tight break-words
  "
                        >
                            {race.titleLabel}
                        </h1>

                        <span
                            className={`
                                text-2xl font-bold px-2.5 py-1 rounded-lg
                                ${race.gradeStyle.bg} ${race.gradeStyle.text}
                                shadow-sm
                            `}
                        >
                            {race.gradeLabel}
                        </span>
                    </div>
                </div>

                {/* コース情報 */}
                <p className="text-slate-600 font-medium ml-1">
                    {race.courseLabel}
                </p>
            </div>
        </section>
    );
}