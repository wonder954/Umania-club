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
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <span className="text-green-600/80 text-2xl animate-coin">💰</span>
                払戻金
                <span className="text-green-600/80 text-2xl animate-coin">💰</span>
            </h2>

            <div className="
                bg-white/70 backdrop-blur-sm 
                rounded-2xl shadow-sm 
                border border-white/40 
                overflow-hidden
            ">
                {/* Header */}
                <div className="
                    px-4 py-3 
                    bg-green-500/15 
                    backdrop-blur-sm 
                    border-b border-green-300/30
                ">
                    <h3 className="text-green-700 font-bold">払戻金</h3>
                </div>

                <div className="p-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* 単勝 */}
                        {payout.win?.length > 0 && (
                            <PayoutCard label="単勝" items={payout.win} color="green" />
                        )}

                        {/* 複勝 */}
                        {payout.place?.length > 0 && (
                            <PayoutCard label="複勝" items={payout.place} color="blue" />
                        )}

                        {/* 折りたたみ部分 */}
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
                                            color="slate"
                                        />
                                    );
                                })}
                    </div>

                    {/* ボタン */}
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="
                            text-slate-700 font-bold mt-4 block mx-auto
                            bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl
                            border border-slate-300/40 shadow-sm hover:shadow-md
                            hover:bg-white/80 transition
                        "
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
    color = "slate",
}: {
    label: string;
    items: PayoutItem[];
    animated?: boolean;
    color?: "green" | "blue" | "slate";
}) {
    const colorMap = {
        green: {
            bg: "bg-green-100/50",
            text: "text-green-700",
            border: "border-green-300/40",
        },
        blue: {
            bg: "bg-blue-100/50",
            text: "text-blue-700",
            border: "border-blue-300/40",
        },
        slate: {
            bg: "bg-slate-100/40",
            text: "text-slate-700",
            border: "border-slate-300/40",
        },
    };

    const c = colorMap[color];

    return (
        <div
            className={`
                rounded-xl overflow-hidden 
                bg-white/60 backdrop-blur-sm shadow-sm
                border ${c.border}
                ${animated ? "animate-slideFadeDown" : ""}
            `}
        >
            <div className={`px-3 py-2 font-bold text-sm ${c.bg} ${c.text} border-b ${c.border}`}>
                {label}
            </div>

            <table className="w-full text-sm table-fixed">
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx} className={`border-t ${c.border}`}>
                            <td className="px-3 py-2 font-mono text-center text-slate-700">
                                {item.numbers.join(" - ")}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-slate-800 tabular-nums">
                                ¥{item.amount.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-500 text-xs tabular-nums">
                                {item.popular}人気
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}