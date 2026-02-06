"use client";

import Link from "next/link";
import { Select } from "@/components/common/Select";
import { useRaceSearch } from "@/hooks/useRaceSearch";
import type { Race } from "@/lib/races";
import { formatDateWithWeekday } from "@/lib/date";
import { getColorFromGrade } from "@/lib/race/racesToCalendarRaces";

type Props = {
    races: Race[];
};

export default function RaceSearchForm({ races }: Props) {
    const {
        selectedYear,
        selectedMonth,
        setSelectedYear,
        setSelectedMonth,
        filteredRaces,
        years,
        months,
    } = useRaceSearch(races);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                過去のレースを検索
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <Select
                    label="年"
                    value={selectedYear}
                    options={years}
                    onChange={(val) => {
                        setSelectedYear(val.toString());
                        setSelectedMonth(""); // 年を変えたら月をリセット
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

            {/* レース一覧表示 (月が選択されたら表示) */}
            {selectedMonth && (
                <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        レース一覧 ({filteredRaces.length}件)
                    </label>
                    <div className="bg-gray-50 rounded-lg p-2 max-h-60 overflow-y-auto border border-gray-200">
                        {filteredRaces.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">
                                該当するレースデータはありません
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {filteredRaces.map((race) => {
                                    const colorClass = getColorFromGrade(race.grade ?? "OP");
                                    // Extract the background color for the border (e.g., "bg-red-500" -> "border-red-500")
                                    const bgClass = colorClass.split(" ").find((c: string) => c.startsWith("bg-"));
                                    const borderClass = bgClass?.replace("bg-", "border-") || "border-gray-200";

                                    return (
                                        <Link
                                            key={race.id}
                                            href={`/races/${race.id}`}
                                            className={`block w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border-l-4 ${borderClass} border-r border-y border-gray-100 rounded-r-md shadow-sm transition-all hover:shadow-md flex justify-between items-center group`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 mb-0.5">
                                                    {formatDateWithWeekday(race.date)} {race.place}
                                                </span>
                                                <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                    {race.name}
                                                </span>
                                            </div>
                                            {race.grade && (
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded ${colorClass}`}>
                                                    {race.grade}
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
