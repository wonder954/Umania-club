"use client";

import MarkSelector from "@/components/prediction/MarkSelector";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";
import Image from "next/image";
import type { Mark } from "@/types/mark";
import { frameColors } from "@/constants/race";
import { pcOddsColor, mobileOddsColor } from "@/utils/race/oddsColor";
import { PopularBadgePC, PopularBadgeMobile } from "@/components/common/PopularBadge";

type Props = {
    race: RaceViewModel;
    prediction: Record<string, Mark>;
    onPredictionChange: (prediction: Record<string, Mark>) => void;
};

export default function HorseTable({ race, prediction, onPredictionChange }: Props) {

    return (
        <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <Image src="/newspaper.png" alt="newspaper" width={28} height={28} className="h-7 w-auto object-contain drop-shadow-sm" />
                出馬表
                <Image src="/newspaper.png" alt="newspaper" width={28} height={28} className="h-7 w-auto object-contain drop-shadow-sm" />
            </h2>

            <p className="text-sm text-slate-500 px-1 mt-1 mb-2">
                ※買い目を追加するには、まず出馬表で印をつけてください
            </p>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/40 overflow-hidden">

                {/* ▼▼ スマホ版（md未満） ▼▼ */}
                <div className="md:hidden divide-y divide-slate-300/30">
                    {race.entries.map((horse) => {
                        const frame = horse.frame ?? "";
                        const hasFrame = !!horse.frame;
                        const hasNumber = !!horse.number;
                        const hasWeight = !!horse.weight;
                        const hasJockey = !!horse.jockey;

                        const jockeyShort =
                            horse.jockey?.replace(/[\s.]/g, "").slice(0, 3) || "";

                        const isConfirmed = hasFrame && hasNumber;

                        return (
                            <div key={horse.number || horse.name} className="py-3 px-3">

                                {/* ▼ 登録馬 UI（枠・馬番なし） ▼ */}
                                {!isConfirmed && (
                                    <>
                                        {/* 1行目：◎〇▲△ */}
                                        <div className="flex gap-1 mb-1">
                                            <MarkSelector
                                                prediction={prediction}
                                                targetKey={horse.name}
                                                onChange={onPredictionChange}
                                                filter={["◎", "〇", "▲", "△"]}
                                            />
                                        </div>

                                        {/* 2行目：馬名 */}
                                        <div className="font-bold text-[15px] text-slate-800 truncate">
                                            {horse.name}
                                        </div>
                                    </>
                                )}

                                {/* ▼ 確定版 UI ▼ */}
                                {isConfirmed && (
                                    <>
                                        {/* 1行目：枠番 + 印 + オッズ＋人気（同じ行） */}
                                        <div className="flex items-center mb-1">

                                            {/* 枠番 */}
                                            <div
                                                className={`
                    w-7 h-7 flex items-center justify-center rounded font-bold shadow-sm
                    ${frameColors[frame] ?? ""}
                `}
                                            >
                                                {horse.frame}
                                            </div>

                                            {/* 印 */}
                                            <div className="flex gap-1 ml-2">
                                                <MarkSelector
                                                    prediction={prediction}
                                                    targetKey={horse.name}
                                                    onChange={onPredictionChange}
                                                    filter={["◎", "〇", "▲", "△"]}
                                                />
                                            </div>

                                            <div className="ml-auto flex items-center gap-2 text-right">

                                                {/* オッズ */}
                                                <span className={`text-[13px] ${mobileOddsColor(horse.odds)}`}>
                                                    {horse.odds ?? "-"}倍
                                                </span>

                                                {/* 人気 */}
                                                <div className="flex justify-end">
                                                    <PopularBadgeMobile popular={horse.popular} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2行目：馬番 + 馬名 + 斤量＋騎手（同じ行） */}
                                        <div className="flex items-center">

                                            {/* 馬番 */}
                                            <div className="w-7 h-7 flex items-center justify-center font-bold text-slate-800">
                                                {horse.number}
                                            </div>

                                            {/* 馬名 */}
                                            <div className="flex-1 ml-2 font-bold text-[15px] text-slate-800 truncate">
                                                {horse.name}
                                            </div>

                                            {/* 斤量＋騎手（同じ行） */}
                                            <div className="ml-auto flex items-center gap-2 text-right">
                                                <span className="text-[13px] font-semibold text-slate-700">
                                                    {horse.weight}
                                                </span>
                                                <span className="text-[13px] text-slate-500 truncate">
                                                    {jockeyShort}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ▼▼ PC版（md以上） ▼▼ */}
                <div className="hidden md:block">
                    <table className="w-full text-sm text-slate-800">
                        <thead className="bg-slate-100/60 border-b border-slate-300/40">
                            <tr>
                                <th className="px-3 py-2 text-left">枠</th>
                                <th className="px-3 py-2 text-left">馬番</th>
                                <th className="px-3 py-2 text-left">印</th>
                                <th className="px-3 py-2 text-left">馬名</th>
                                <th className="px-3 py-2 text-left">斤量</th>
                                <th className="px-3 py-2 text-left">騎手</th>
                                <th className="px-3 py-2 text-left">オッズ</th>
                                <th className="px-3 py-2 text-left">人気</th>
                            </tr>
                        </thead>

                        <tbody>
                            {race.entries.map((horse) => {
                                const frame = horse.frame ?? "";

                                return (
                                    <tr
                                        key={horse.number || horse.name}
                                        className="border-t border-slate-300/30 hover:bg-slate-100/40 transition"
                                    >
                                        <td className="px-3 py-2">
                                            <span
                                                className={`
                                                    px-3 py-1 rounded font-bold inline-block text-center shadow-sm
                                                    ${frameColors[frame] ?? ""}
                                                `}
                                            >
                                                {horse.frame}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2 font-mono font-bold text-slate-800">
                                            {horse.number || "-"}
                                        </td>

                                        <td className="px-3 py-2">
                                            <MarkSelector
                                                prediction={prediction}
                                                targetKey={horse.name}
                                                onChange={onPredictionChange}
                                            />
                                        </td>

                                        <td className="px-3 py-2 whitespace-nowrap font-bold text-slate-800">
                                            {horse.name}
                                        </td>

                                        <td className="px-3 py-2 text-slate-700">{horse.weight}</td>
                                        <td className="px-3 py-2 text-slate-700">{horse.jockey}</td>
                                        <td className={`px-3 py-2 text-right font-mono ${pcOddsColor(horse.odds)}`}>{horse.odds ?? "-"}</td>
                                        <td className="px-3 py-2 text-center"><PopularBadgePC popular={horse.popular} /></td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}