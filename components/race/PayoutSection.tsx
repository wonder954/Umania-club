"use client";

import { useState } from "react";
import type { Payout, PayoutItem } from "@/types/race";

type Props = {
    payout: Payout;
};

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

export default function PayoutSection({ payout }: Props) {
    const [showMore, setShowMore] = useState(false);

    return (
        <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-green-600 text-2xl animate-coin">💰</span>
                払戻金
                <span className="text-green-600 text-2xl animate-coin">💰</span>
            </h2>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
                    <h3 className="text-white font-bold">払戻金</h3>
                </div>

                <div className="p-4">

                    {/* グリッド（単勝・複勝・折りたたみ部分） */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* --- 単勝（win） --- */}
                        {payout.win?.length > 0 && (
                            <PayoutCard label="単勝" items={payout.win} />
                        )}

                        {/* --- 複勝（place） --- */}
                        {payout.place?.length > 0 && (
                            <PayoutCard label="複勝" items={payout.place} />
                        )}

                        {/* --- 折りたたみ部分 --- */}
                        {showMore &&
                            (Object.keys(payoutLabels) as Array<keyof Payout>)
                                .filter((key) => key !== "win" && key !== "place")
                                .map((key) => {
                                    const items = payout[key];
                                    if (!items?.length) return null;

                                    return (
                                        <PayoutCard
                                            key={key}
                                            label={payoutLabels[key]}
                                            items={items}
                                            animated
                                        />
                                    );
                                })}
                    </div>

                    {/* --- ボタンは grid の外に置く --- */}
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="text-blue-600 font-bold mt-4 block mx-auto"
                    >
                        {showMore ? "▲ 払戻金を閉じる" : "▼ 払戻金をもっと見る"}
                    </button>

                </div>
            </div>
        </section>
    );
}



function PayoutCard({
    label,
    items,
    animated = false,
}: {
    label: string;
    items: PayoutItem[];
    animated?: boolean;
}) {
    return (
        <div
            className={`border rounded-lg overflow-hidden ${animated ? "animate-slideFadeDown" : ""
                }`}
        >
            <div className="bg-gray-100 px-3 py-2 font-bold text-sm">{label}</div>

            <table className="w-full text-sm table-fixed">
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx} className="border-t">
                            <td className="px-3 py-2 font-mono text-center">
                                {item.numbers.join(" - ")}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-blue-600 tabular-nums">
                                ¥{item.amount.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-500 text-xs tabular-nums">
                                {item.popular}人気
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
