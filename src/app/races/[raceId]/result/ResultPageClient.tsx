"use client";

import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import Link from "next/link";
import RaceResultSection from "@/src/components/race/RaceResultSection";
import PayoutSection from "@/src/components/race/PayoutSection";
import CommunityResultSection from "@/src/components/race/CommunityResultSection";
import { RaceHeaderCard } from "@/src/components/race/RaceHeaderCard";
import { RaceVideo } from "@/src/components/race/RaceVideo";

import type { FirestoreRace } from "@/src/lib/race/types";
import { toRaceViewModel } from "@/src/viewmodels/raceViewModel";

export default function ResultPageClient({ raceId }: { raceId: string }) {
    const [race, setRace] = useState<FirestoreRace | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRace() {
            const ref = doc(db, "races", raceId);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const plain = JSON.parse(JSON.stringify(snap.data()));
                setRace({ id: raceId, ...plain } as FirestoreRace);
            } else {
                setRace(null);
            }

            setLoading(false);
        }

        fetchRace();
    }, [raceId]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    if (!race) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-8 text-center max-w-md border border-white/40">
                    <div className="text-6xl mb-4">🏇</div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">レースが見つかりません</h1>
                    <p className="text-slate-600 mb-6">指定されたレースID: {raceId}</p>
                    <Link href="/" className="inline-block bg-white/80 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-xl shadow-sm hover:shadow-md border border-white/40 transition">
                        レース一覧へ戻る
                    </Link>
                </div>
            </div>
        );
    }

    if (!race.result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-8 text-center max-w-md border border-white/40">
                    <div className="text-6xl mb-4">⏳</div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">結果はまだありません</h1>
                    <p className="text-slate-600 mb-6">レース結果が登録されていません。</p>
                    <Link href={`/races/${raceId}`} className="inline-block bg-white/80 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-xl shadow-sm hover:shadow-md border border-white/40 transition">
                        レースページへ戻る
                    </Link>
                </div>
            </div>
        );
    }

    const vm = toRaceViewModel(race);

    return (
        <div className="min-h-screen pb-20 bg-transparent">
            <RaceHeaderCard race={vm} />

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                <RaceVideo videoId={race.videoId} />
                <RaceResultSection result={race.result} />
                <PayoutSection payout={race.result.payout} />
                <CommunityResultSection race={vm} />
            </main>
        </div>
    );
}
