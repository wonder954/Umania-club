"use client";

import MarkSelector from "@/components/prediction/MarkSelector";
import { useState, useEffect } from "react";
import { getRace } from "@/lib/races";
import Link from "next/link";
import PredictionForm from "@/components/prediction/PredictionForm";
import PostList from "@/components/community/PostList";
import Image from "next/image";
import { Bet } from "@/components/prediction/BettingForm";

export default function RacePage({ params }: { params: { raceId: string } }) {
    const [race, setRace] = useState<any>(null);

    const [prediction, setPrediction] = useState<Record<string, string>>({});
    const [bets, setBets] = useState<Bet[]>([]);
    const [comment, setComment] = useState("");

    // 🔥 クライアント側でレースデータを取得
    useEffect(() => {
        async function load() {
            const r = await getRace(params.raceId);
            setRace(r);
        }
        load();
    }, [params.raceId]);

    if (!race) {
        return <div className="p-10 text-center">読み込み中...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            {/* Header */}
            <header className="bg-white shadow sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-gray-500 hover:text-gray-900 font-bold">
                        ← レース一覧
                    </Link>
                    <div className="text-sm font-bold truncate max-w-[60vw]">{race.name}</div>
                    <div className="w-20"></div>
                </div>
            </header>

            {/* Race Info Card */}
            <section className="bg-white rounded-lg shadow-md p-6 border-l-8 border-yellow-500 w-full max-w-4xl mx-auto mt-6">
                <div className="flex flex-col gap-4">

                    {/* 上段：グレード + 日付 */}
                    <div className="flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                            {race.grade}
                        </span>
                        <span className="text-gray-500 text-sm">{race.date}</span>
                    </div>

                    {/* 中段：場所 / レース番号 */}
                    <p className="text-gray-600 text-sm font-medium ml-1">
                        {race.place} / {race.raceNumber}
                    </p>

                    {/* タイトル行 */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Image
                            src="/umania-club%20logo.png"
                            alt="Umania-club"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                        <h1 className="text-3xl font-extrabold text-gray-900 break-words">
                            {race.name}
                        </h1>
                    </div>

                    {/* コース情報 */}
                    <p className="text-gray-600 font-medium ml-1">
                        {race.course.surface} {race.course.distance}m（
                        {race.course.direction}
                        {race.course.courseDetail}）
                    </p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                {/* 出馬表 */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                        出馬表
                    </h2>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-2 text-left">枠</th>
                                    <th className="px-3 py-2 text-left">馬番</th>
                                    <th className="px-3 py-2 text-left">印</th>
                                    <th className="px-3 py-2 text-left">馬名</th>
                                    <th className="px-3 py-2 text-left">斤量</th>
                                    <th className="px-3 py-2 text-left">騎手</th>
                                </tr>
                            </thead>

                            <tbody>
                                {race.horses.map((horse: any) => {
                                    const frame = Number(horse.frame);
                                    const frameColors: Record<number, string> = {
                                        1: "bg-white text-black border",
                                        2: "bg-black text-white",
                                        3: "bg-red-600 text-white",
                                        4: "bg-blue-600 text-white",
                                        5: "bg-yellow-400 text-black",
                                        6: "bg-green-600 text-white",
                                        7: "bg-orange-500 text-white",
                                        8: "bg-pink-500 text-white",
                                    };

                                    return (
                                        <tr key={horse.number} className="border-t">
                                            <td className="px-3 py-2">
                                                <span
                                                    className={`px-3 py-1 rounded font-bold inline-block text-center ${frameColors[frame]}`}
                                                >
                                                    {horse.frame}
                                                </span>
                                            </td>

                                            <td className="px-3 py-2">{horse.number}</td>

                                            {/* 印 */}
                                            <td className="px-3 py-2">
                                                <MarkSelector
                                                    prediction={prediction}
                                                    targetKey={horse.name}
                                                    onChange={setPrediction}
                                                />
                                            </td>

                                            <td className="px-3 py-2">{horse.name}</td>
                                            <td className="px-3 py-2">{horse.weight}</td>
                                            <td className="px-3 py-2">{horse.jockey}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Prediction Form */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                        あなたの予想
                    </h2>

                    <PredictionForm
                        race={race}
                        prediction={prediction}
                        setPrediction={setPrediction}
                        bets={bets}
                        setBets={setBets}
                        comment={comment}
                        setComment={setComment}
                    />
                </section>

                {/* Community Timeline */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        みんなの予想
                    </h2>
                    <PostList raceId={race.id} race={race} />
                </section>
            </main>
        </div>
    );
}