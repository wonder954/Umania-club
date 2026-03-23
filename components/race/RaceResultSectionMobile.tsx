"use client";

import type { RaceOrder } from "@/lib/race/types";
import { frameColors } from "@/constants/race";
import { mobileOddsColor } from "@/utils/race/oddsColor";
import { PopularBadgeMobile } from "@/components/common/PopularBadge";

type Props = {
    horses: RaceOrder[];        // 表示する馬のリスト（showAll済みのものを渡す）
    others: RaceOrder[];        // 折りたたみボタンの表示に使う
    showAll: boolean;
    onToggleShowAll: () => void;
};

export default function RaceResultSectionMobile({ horses, others, showAll, onToggleShowAll }: Props) {
    return (
        <div className="sm:hidden p-3 space-y-3">
            {horses.map((horse) => (
                <RaceResultSectionMobileCard key={horse.number} horse={horse} />
            ))}

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

// --- 1頭分のカード ---
type CardProps = {
    horse: RaceOrder;
};

function RaceResultSectionMobileCard({ horse }: CardProps) {
    const jockeyShort = horse.jockey?.replace(/[\s.]/g, "").slice(0, 3) ?? "";
    return (
        <div
            className={`
                border rounded-xl p-4 shadow-sm
                bg-white/70 backdrop-blur-sm
                border-white/40
                ${horse.rank <= 3 ? "bg-yellow-100/40" : ""}
            `}
        >
            {/* 上段：着順・枠・馬番・馬名・騎手 */}
            <div className="flex items-center gap-1.5 mb-3">
                <div className="font-bold w-6 text-center text-lg">
                    <RankBadge rank={horse.rank} />
                </div>

                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${frameColors[horse.frame]} opacity-80`}>
                    {horse.frame}
                </span>

                <span className="font-mono font-bold text-base text-slate-800">{horse.number}</span>

                <span className="font-bold text-base truncate flex-1 min-w-0 text-slate-800">{horse.name}</span>

                <span className="text-sm text-slate-600 shrink-0 ml-2">{jockeyShort}</span>
            </div>

            {/* データグリッド */}
            <div className="grid grid-cols-2 gap-2 text-sm">
                {/* タイム */}
                <div className="grid grid-cols-[auto_auto] gap-1 justify-end">
                    <span className="text-slate-500 text-right">タイム:</span>
                    {horse.rank === 1 ? (
                        <span className="px-3 py-1 rounded-full bg-yellow-200/60 text-yellow-900 text-sm font-mono font-bold shadow-sm">
                            {horse.time}
                        </span>
                    ) : (
                        <span className="font-mono font-medium text-right text-slate-700">{horse.time}</span>
                    )}
                </div>

                {/* オッズ */}
                <div className="grid grid-cols-[auto_auto] gap-1 justify-end">
                    <span className="text-slate-500 text-right">オッズ:</span>
                    <OddsBadge odds={horse.odds} />
                </div>

                {/* 着差 */}
                <div className="grid grid-cols-[auto_auto] gap-1 justify-end">
                    <span className="text-slate-500 text-right">着差:</span>
                    <span className="font-medium text-right text-slate-700">{horse.margin ?? "-"}</span>
                </div>

                {/* 人気 */}
                <div className="grid grid-cols-[auto_auto] gap-1 justify-end">
                    <span className="text-slate-500 text-right">人気:</span>
                    <PopularBadgeMobile popular={horse.popular} />
                </div>
            </div>
        </div>
    );
}

// --- 着順バッジ ---
function RankBadge({ rank }: { rank: number }) {
    if (rank > 3) return <>{rank}</>;

    return (
        <span
            className={`
                inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm
                ${rank === 1 ? "bg-yellow-400/70 text-yellow-900" : ""}
                ${rank === 2 ? "bg-gray-300/70 text-gray-700" : ""}
                ${rank === 3 ? "bg-orange-300/70 text-orange-900" : ""}
            `}
        >
            {rank}
        </span>
    );
}

// --- オッズバッジ ---
function OddsBadge({ odds }: { odds: number | null }) {
    return (
        <span
            className={`
                px-2 py-0.5 rounded-full text-xs font-mono font-bold
                ${mobileOddsColor(odds)}
            `}
        >
            {odds != null ? `${odds}倍` : "-"}
        </span>
    );
}
