import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import Link from "next/link";

import PredictionArea from "@/components/race/PredictionArea";
import CommunitySection from "@/components/race/CommunitySection";
import ScrollToPostsButton from "@/components/race/ScrollToPostsButton";
import type { FirestoreRace } from "@/lib/race/types";
import { RaceHeaderCard } from "@/components/race/RaceHeaderCard";
import { toRaceViewModel } from "@/viewmodels/raceViewModel";
import { unifyRaceTitle, matchJraRace } from "@/utils/race/normalize";
import { gradeRaces2026 } from "@/lib/grades2026";

type Props = {
    params: { raceId: string };
};

async function getRaceFromFirestore(raceId: string): Promise<FirestoreRace | null> {
    const ref = doc(db, "races", raceId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const plain = JSON.parse(JSON.stringify(snap.data()));

    return { id: raceId, ...plain } as FirestoreRace;
}

export default async function RacePage({ params }: Props) {
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

    const jra = gradeRaces2026.find(j =>
        j.date === race.date && matchJraRace(race.title, j.name)
    );
    const unified = unifyRaceTitle(race, jra);
    const vm = toRaceViewModel(unified);

    return (
        <div className="min-h-screen pb-20 bg-transparent">
            {/* Race Info Card */}
            <RaceHeaderCard race={vm} />

            <div className="max-w-4xl mx-auto mt-4 px-4">
                <ScrollToPostsButton />
            </div>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                {!race.result ? (
                    <>
                        <PredictionArea race={vm} />
                        <CommunitySection raceId={params.raceId} race={vm} />
                    </>
                ) : (
                    <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl p-6 mb-8 text-center shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">レース終了</h3>
                        <p className="text-slate-600 mb-4">このレースは終了しました。</p>
                        <Link
                            href={`/races/${params.raceId}/result`}
                            className="text-blue-600 underline font-medium"
                        >
                            → 結果ページを見る
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}