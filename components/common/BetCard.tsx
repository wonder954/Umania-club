import { Bet } from "@/types/bet";
import { Race } from "@/lib/races";
import { judgeHit } from "@/utils/race/judge";
import { formatBetStructure } from "@/utils/bets/format";

type Props = {
    bet: Bet;
    race?: Race;
    showHit?: boolean;
};

export default function BetCard({ bet, race, showHit = false }: Props) {
    const structure = formatBetStructure(bet);
    const hitInfo = showHit && race?.result ? judgeHit(bet, race.result) : null;

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">

            {/* 馬券種 ＋ 買い方（横並び） */}
            <div className="flex items-center gap-2 text-xs font-semibold">
                {/* 馬券種：深緑 */}
                <span className="px-2 py-1 rounded-full bg-green-700 text-white">
                    {bet.type}
                </span>

                {/* 買い方：落ち着いたグレー */}
                <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                    {structure.buyType}
                </span>

                {/* マルチ：ゴールド */}
                {bet.isMulti && (
                    <span className="px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">
                        マルチ
                    </span>
                )}
            </div>

            {/* 買い目の構造 */}
            <div className="space-y-1">
                {structure.rows.map((row, i) => (
                    <div key={i} className="text-sm">
                        {row.label && (
                            <div className="font-bold text-gray-700">{row.label}</div>
                        )}
                        <div className="ml-2 text-gray-900">
                            ［{row.values.join(", ")}］
                        </div>
                    </div>
                ))}
            </div>

            {/* 的中/不的中 ＋ 点数（横並び） */}
            <div className="flex items-center justify-between pt-1">

                {/* 的中/不的中 */}
                {hitInfo ? (
                    <span
                        className={`text-xs font-bold px-2 py-1 rounded ${hitInfo.isHit
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200 text-gray-600"
                            }`}
                    >
                        {hitInfo.isHit
                            ? `🎯 払戻 ${hitInfo.payout.toLocaleString()}円`
                            : "❌ 不的中"}
                    </span>
                ) : (
                    <span className="text-xs text-gray-500">　</span>
                )}

                {/* 点数 */}
                <span className="text-xs font-bold text-gray-700">
                    {bet.points}点
                </span>
            </div>
        </div>
    );
}