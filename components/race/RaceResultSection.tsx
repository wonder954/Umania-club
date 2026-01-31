import type { RaceResult, RaceOrder, Payout, PayoutItem } from "@/types/race";

type Props = {
    result: RaceResult | null | undefined;
};

// 枠番の色
const frameColors: Record<number, string> = {
    1: "bg-white text-black border border-gray-300",
    2: "bg-black text-white",
    3: "bg-red-600 text-white",
    4: "bg-blue-600 text-white",
    5: "bg-yellow-400 text-black",
    6: "bg-green-600 text-white",
    7: "bg-orange-500 text-white",
    8: "bg-pink-500 text-white",
};

// 券種の日本語名
const payoutLabels: Record<keyof Payout, string> = {
    win: "単勝",
    place: "複勝",
    bracket: "枠連",
    quinella: "馬連",
    wide: "ワイド",
    exacta: "馬単",
    trio: "3連複",
    trifecta: "3連単",
};

export default function RaceResultSection({ result }: Props) {
    if (!result) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                <div className="text-4xl mb-3">🏇</div>
                <p className="text-gray-500 font-medium">結果はまだありません</p>
                <p className="text-gray-400 text-sm mt-1">レース終了後に更新されます</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 着順テーブル */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
                    <h3 className="text-white font-bold">競走成績</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2 text-center w-12">着</th>
                                <th className="px-3 py-2 text-center w-12">枠</th>
                                <th className="px-3 py-2 text-center w-12">馬番</th>
                                <th className="px-3 py-2 text-left">馬名</th>
                                <th className="px-3 py-2 text-center">タイム</th>
                                <th className="px-3 py-2 text-center">着差</th>
                                <th className="px-3 py-2 text-left">騎手</th>
                                <th className="px-3 py-2 text-center">人気</th>
                                <th className="px-3 py-2 text-right">オッズ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.order.map((horse) => (
                                <tr
                                    key={horse.number}
                                    className={`border-t ${horse.rank <= 3 ? "bg-yellow-50" : ""}`}
                                >
                                    <td className="px-3 py-2 text-center font-bold">
                                        {horse.rank <= 3 ? (
                                            <span className={`
                                                inline-flex items-center justify-center w-7 h-7 rounded-full font-bold
                                                ${horse.rank === 1 ? "bg-yellow-400 text-yellow-900" : ""}
                                                ${horse.rank === 2 ? "bg-gray-300 text-gray-700" : ""}
                                                ${horse.rank === 3 ? "bg-orange-300 text-orange-900" : ""}
                                            `}>
                                                {horse.rank}
                                            </span>
                                        ) : (
                                            horse.rank
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${frameColors[horse.frame] || ""}`}>
                                            {horse.frame}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center font-mono">{horse.number}</td>
                                    <td className="px-3 py-2 font-medium">{horse.name}</td>
                                    <td className="px-3 py-2 text-center font-mono">{horse.time}</td>
                                    <td className="px-3 py-2 text-center text-gray-500">{horse.margin}</td>
                                    <td className="px-3 py-2">{horse.jockey}</td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`
                                            ${horse.popular === 1 ? "text-red-600 font-bold" : ""}
                                            ${horse.popular === 2 ? "text-blue-600 font-bold" : ""}
                                            ${horse.popular === 3 ? "text-green-600 font-bold" : ""}
                                        `}>
                                            {horse.popular}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right font-mono">{horse.odds}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 払戻金テーブル */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
                    <h3 className="text-white font-bold">払戻金</h3>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(Object.keys(payoutLabels) as Array<keyof Payout>).map((key) => {
                            const items = result.payout[key];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={key} className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-3 py-2 font-bold text-sm">
                                        {payoutLabels[key]}
                                    </div>
                                    <table className="w-full text-sm table-fixed">
                                        <tbody>
                                            {items.map((item, idx) => (
                                                <tr key={idx} className="border-t">

                                                    {/* 組番（中央揃え） */}
                                                    <td className="px-3 py-2 font-mono text-center">
                                                        {item.numbers.join(" - ")}
                                                    </td>

                                                    {/* 払戻金（右揃え・等幅数字） */}
                                                    <td className="px-3 py-2 text-right font-bold text-blue-600 tabular-nums">
                                                        ¥{item.amount.toLocaleString()}
                                                    </td>

                                                    {/* 人気（右揃え・等幅数字） */}
                                                    <td className="px-3 py-2 text-right text-gray-500 text-xs tabular-nums">
                                                        {item.popular}人気
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
