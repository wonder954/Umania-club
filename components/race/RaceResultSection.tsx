"use client";

import { useState } from "react";
import type { RaceResult } from "@/lib/race/types";
import RaceResultSectionPC from "./RaceResultSectionPC";
import RaceResultSectionMobile from "./RaceResultSectionMobile";

type Props = {
    result: RaceResult | null | undefined;
};

export default function RaceResultSection({ result }: Props) {
    const [showAll, setShowAll] = useState(false);

    if (!result) {
        return (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                <div className="text-4xl mb-3">🏇</div>
                <p className="text-gray-500 font-medium">結果はまだありません</p>
                <p className="text-gray-400 text-sm mt-1">レース終了後に更新されます</p>
            </div>
        );
    }

    const top5 = result.order.slice(0, 5);
    const others = result.order.slice(5);
    const displayHorses = showAll ? result.order : top5; // Mobile用（表示する馬をまとめて渡す）

    return (
        <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-600 text-2xl animate-result">🏇</span>
                レース結果
                <span className="text-purple-600 text-2xl animate-result">🏇</span>
            </h2>

            <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-white/40">

                    {/* 見出し */}
                    <div className="px-4 py-3 bg-purple-500/20 backdrop-blur-sm border-b border-purple-300/30">
                        <h3 className="text-purple-800 font-bold">競走成績</h3>
                    </div>

                    {/* PC用テーブル */}
                    <RaceResultSectionPC
                        top5={top5}
                        others={others}
                        showAll={showAll}
                        onToggleShowAll={() => setShowAll(!showAll)}
                    />

                    {/* スマホ用カード */}
                    <RaceResultSectionMobile
                        horses={displayHorses}
                        others={others}
                        showAll={showAll}
                        onToggleShowAll={() => setShowAll(!showAll)}
                    />
                </div>
            </div>
        </section>
    );
}