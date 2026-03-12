"use client";

import Link from "next/link";
import { Select } from "@/components/common/Select";
import { useRaceSearch } from "@/hooks/useRaceSearch";
import type { Race } from "@/lib/races";
import { formatDateWithWeekday } from "@/lib/date";
import { getGradeStyleUI } from "@/utils/race/raceGradeUtils.ui";
import { formatRaceName } from "@/utils/race";

type Props = {
    races: Race[];
};

export default function RaceSearchForm({ races }: Props) {
    const {
        selectedYear,
        selectedMonth,
        keyword,
        setSelectedYear,
        setSelectedMonth,
        setKeyword,
        filteredRaces,
        years,
        months,
    } = useRaceSearch(races);

    return (
        <div
            className="
                w-full max-w-4xl mx-auto 
                bg-white/70 backdrop-blur-sm 
                p-6 rounded-2xl shadow-sm 
                border border-white/40 
                mb-8
            "
        >
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-300/40 pb-2">
                過去のレースを検索
            </h2>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="レース名・日付で検索（例: 弥生賞 / 2026）"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="
            w-full px-4 py-2 rounded-xl
            border border-slate-300/40
            bg-white/70 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-blue-300/40
        "
                />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Select
                    label="年"
                    value={selectedYear}
                    options={years}
                    onChange={(val) => {
                        setSelectedYear(val.toString());
                        setSelectedMonth("");
                    }}
                />
                <Select
                    label="月"
                    value={selectedMonth}
                    options={months}
                    onChange={(val) => setSelectedMonth(val.toString())}
                    placeholder="月を選択"
                    disabled={!selectedYear}
                />
            </div>

            {/* レース一覧表示 */}
            {filteredRaces.length > 0 && (
                <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        レース一覧 ({filteredRaces.length}件)
                    </label>

                    <div
                        className="
                            bg-white/50 backdrop-blur-sm 
                            rounded-xl p-2 
                            max-h-60 overflow-y-auto 
                            border border-slate-300/40
                        "
                    >
                        {filteredRaces.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-4">
                                該当するレースデータはありません
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {filteredRaces.map((race) => {
                                    const style = getGradeStyleUI(race.info.grade);

                                    return (
                                        <Link
                                            key={race.raceId}
                                            href={`/races/${race.raceId}`}
                                            className={`
                block w-full text-left px-4 py-3 
                bg-white/70 backdrop-blur-sm 
                hover:bg-white/90 
                border-l-4 ${style.border}/60
                border border-white/40 
                rounded-xl shadow-sm 
                transition-all hover:shadow-md 
                flex justify-between items-center group
            `}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-500 mb-0.5">
                                                    {formatDateWithWeekday(race.info.date)} {race.info.place}
                                                </span>
                                                <span className="font-bold text-slate-800 group-hover:text-blue-600/80 transition-colors">
                                                    {formatRaceName(race.info.title)}
                                                </span>
                                            </div>

                                            {race.info.grade && (
                                                <span
                                                    className={`
                        text-xs font-bold px-2.5 py-1 rounded 
                        ${style.bg} ${style.text} opacity-80
                    `}
                                                >
                                                    {style.label}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}