"use client";

import type { RaceOrder } from "@/lib/race/types";
import { frameColors } from "@/constants/race";

type Props = {
    top5: RaceOrder[];
    others: RaceOrder[];
    showAll: boolean;
    onToggleShowAll: () => void;
};

export default function RaceResultSectionPC({ top5, others, showAll, onToggleShowAll }: Props) {
    return (
        <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm text-slate-800" style={{ minWidth: "800px" }}>
                <colgroup>
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "12%" }} />
                </colgroup>

                <thead className="bg-slate-100/60 border-b border-slate-300/40">
                    <tr>
                        <th className="px-3 py-2 text-center">着</th>
                        <th className="px-3 py-2 text-center">枠</th>
                        <th className="px-3 py-2 text-center">馬番</th>
                        <th className="px-3 py-2 text-left">馬名</th>
                        <th className="px-3 py-2 text-center">タイム</th>
                        <th className="px-3 py-2 text-center">着差</th>
                        <th className="px-3 py-2 text-left">騎手</th>
                        <th className="px-3 py-2 text-center">人気</th>
                        <th className="px-3 py-2 text-right">オッズ</th>
                    </tr>
                </thead>

                <tbody>
                    {/* 1〜5着 */}
                    {top5.map((horse) => (
                        <RaceResultSectionPCRow key={horse.number} horse={horse} />
                    ))}

                    {/* 6着以降 */}
                    {showAll &&
                        others.map((horse) => (
                            <RaceResultSectionPCRow
                                key={horse.number}
                                horse={horse}
                                className="bg-slate-50/40 animate-slideFadeDown"
                            />
                        ))}
                </tbody>
            </table>

            {/* 折りたたみボタン */}
            {others.length > 0 && (
                <div className="p-3 text-center">
                    <button
                        onClick={onToggleShowAll}
                        className="text-sm font-bold text-blue-600/80 hover:text-blue-700 hover:underline transition"
                    >
                        {showAll ? "▲ 閉じる" : `▼ 6着以降を表示(${others.length}頭)`}
                    </button>
                </div>
            )}
        </div>
    );
}

// --- テーブルの1行分 ---
type RowProps = {
    horse: RaceOrder;
    className?: string;
};

function RaceResultSectionPCRow({ horse, className }: RowProps) {
    return (
        <tr
            className={`
                border-t border-slate-300/30
                ${horse.rank <= 3 ? "bg-yellow-100/40" : "bg-white/40"}
                ${className ?? ""}
            `}
        >
            {/* 着順 */}
            <td className="px-3 py-2 text-center font-bold">
                <RankBadge rank={horse.rank} />
            </td>

            {/* 枠色 */}
            <td className="px-3 py-2 text-center">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${frameColors[horse.frame]} opacity-80`}>
                    {horse.frame}
                </span>
            </td>

            <td className="px-3 py-2 text-center font-mono">{horse.number}</td>
            <td className="px-3 py-2 font-medium">{horse.name}</td>
            <td className="px-3 py-2 text-center font-mono">{horse.time}</td>
            <td className="px-3 py-2 text-center text-slate-500">{horse.margin}</td>
            <td className="px-3 py-2">{horse.jockey}</td>

            {/* 人気 */}
            <td className="px-3 py-2 text-center">
                <span
                    className={`
                        font-bold
                        ${horse.popular === 1 ? "text-red-600/80" : ""}
                        ${horse.popular === 2 ? "text-blue-600/80" : ""}
                        ${horse.popular === 3 ? "text-green-600/80" : ""}
                    `}
                >
                    {horse.popular}
                </span>
            </td>

            <td className="px-3 py-2 text-right font-mono">{horse.odds}</td>
        </tr>
    );
}

// --- 着順バッジ（1〜3着は色付き丸バッジ、それ以外は数字のみ） ---
function RankBadge({ rank }: { rank: number }) {
    if (rank > 3) return <>{rank}</>;

    return (
        <span
            className={`
                inline-flex items-center justify-center w-7 h-7 rounded-full font-bold
                ${rank === 1 ? "bg-yellow-400/70 text-yellow-900" : ""}
                ${rank === 2 ? "bg-gray-300/70 text-gray-700" : ""}
                ${rank === 3 ? "bg-orange-300/70 text-orange-900" : ""}
            `}
        >
            {rank}
        </span>
    );
}