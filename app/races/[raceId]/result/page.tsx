import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import RaceResultSection from "@/components/race/RaceResultSection";
import PayoutSection from "@/components/race/PayoutSection";
import CommunityResultSection from "@/components/race/CommunityResultSection";
import type { Race } from "@/lib/races";
import { RaceHeaderCard } from "@/components/race/RaceHeaderCard";
import { RaceVideo } from "@/components/race/RaceVideo";



type Props = {
    params: { raceId: string };
};

async function getRaceFromFirestore(raceId: string): Promise<Race | null> {
    const ref = doc(db, "races", raceId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const plain = JSON.parse(JSON.stringify(snap.data()));
    return plain as Race;
}

export default async function ResultPage({ params }: Props) {
    const race = await getRaceFromFirestore(params.raceId);

    if (!race) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-8 text-center max-w-md border border-white/40">
                    <div className="text-6xl mb-4">🏇</div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">レースが見つかりません</h1>
                    <p className="text-slate-600 mb-6">
                        指定されたレースID: {params.raceId}
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-white/80 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-xl shadow-sm hover:shadow-md border border-white/40 transition"
                    >
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
                    <Link
                        href={`/races/${params.raceId}`}
                        className="inline-block bg-white/80 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-xl shadow-sm hover:shadow-md border border-white/40 transition"
                    >
                        レースページへ戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 bg-transparent">
            <RaceHeaderCard race={race} />

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                {race.info.videoId && (
                    <section className="mt-8">
                        <h2 className="text-lg font-semibold mb-3">レース動画</h2>
                        <RaceVideo videoId={race.info.videoId} />
                    </section>
                )}
                <RaceResultSection result={race.result} />
                <PayoutSection payout={race.result.payout} />
                <CommunityResultSection race={race} />
            </main>
        </div>
    );
}