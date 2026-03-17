import { Bet } from "@/types/bet";
import type { FirestoreRace } from "@/lib/race/types";   // ← 修正
import { judgeHit } from "@/utils/race/judge";
import { formatBetStructure } from "@/utils/bets/format";

type Props = {
    bet: Bet;
    race: FirestoreRace;   // ← 修正
    showHit?: boolean;
};

export default function BetCard({ bet, race, showHit = false }: Props) {
    const structure = formatBetStructure(bet);
    const hitInfo = showHit && race.result ? judgeHit(bet, race.result) : null;

    return (
        <div
            className="
                bg-white/70 backdrop-blur-sm 
                p-4 rounded-2xl 
                border border-white/40 
                shadow-sm space-y-3
            "
        >
            {/* 馬券種 ＋ 買い方 */}
            <div className="flex items-center gap-2 text-xs font-semibold">

                <span className="px-2 py-1 rounded-full bg-green-600/70 text-white shadow-sm">
                    {bet.type}
                </span>

                <span className="px-2 py-1 rounded-full bg-slate-200/70 text-slate-700 shadow-sm">
                    {structure.buyType}
                </span>

                {bet.isMulti && (
                    <span className="px-2 py-1 rounded-full bg-yellow-200/70 text-yellow-800 shadow-sm">
                        マルチ
                    </span>
                )}
            </div>

            {/* 買い目の構造 */}
            <div className="space-y-1">
                {structure.rows.map((row, i) => (
                    <div key={i} className="text-sm">
                        {row.label && (
                            <div className="font-bold text-slate-700">{row.label}</div>
                        )}
                        <div className="ml-2 text-slate-900">
                            ［{row.values.join(", ")}］
                        </div>
                    </div>
                ))}
            </div>

            {/* 的中/不的中 ＋ 点数 */}
            <div className="flex items-center justify-between pt-1">

                {hitInfo ? (
                    <span
                        className={`
                            text-xs font-bold px-2 py-1 rounded shadow-sm
                            ${hitInfo.isHit
                                ? "bg-red-100/70 text-red-700"
                                : "bg-slate-200/70 text-slate-600"
                            }
                        `}
                    >
                        {hitInfo.isHit
                            ? `🎯 払戻 ${hitInfo.payout.toLocaleString()}円`
                            : "❌ 不的中"}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">　</span>
                )}

                <span className="text-xs font-bold text-slate-700">
                    合計{bet.points}点
                </span>
            </div>
        </div>
    );
}