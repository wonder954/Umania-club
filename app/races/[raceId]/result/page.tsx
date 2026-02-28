import { adminDb } from "@/scripts/scraper/firebase-admin";
import { formatDateWithWeekday } from "@/lib/date";
import Link from "next/link";
import Image from "next/image";

import RaceResultSection from "@/components/race/RaceResultSection";
import PayoutSection from "@/components/race/PayoutSection";
import CommunityResultSection from "@/components/race/CommunityResultSection";
import type { Race } from "@/lib/races";

type Props = {
    params: { raceId: string };
};

async function getRaceFromFirestore(raceId: string): Promise<Race | null> {
    const snap = await adminDb.collection("races").doc(raceId).get();
    if (!snap.exists) return null;
    return snap.data() as Race;
}

export default async function ResultPage({ params }: Props) {
    const race = await getRaceFromFirestore(params.raceId);

    // レースが存在しない
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

    // 結果がまだ無い
    if (!race.result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-8 text-center max-w-md border border-white/40">
                    <div className="text-6xl mb-4">⏳</div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">結果はまだありません</h1>
                    <p className="text-slate-600 mb-6">
                        レース結果が登録されていません。
                    </p>
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
            {/* レース情報カード */}
            <section
                className={`
                    bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-6
                    border border-white/40
                    w-full max-w-4xl mx-auto mt-6
                `}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Image
                            src="/umania-club logo.png"
                            alt="Umania-club"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                        <span className="text-slate-600 text-sm font-medium">
                            {formatDateWithWeekday(race.date)}
                        </span>
                    </div>

                    <div className="flex items-start gap-2">
                        <div className="leading-tight text-lg font-bold text-slate-800 min-w-[42px]">
                            <div>{race.place}</div>
                            <div>{race.raceNumber}</div>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                            <h1 className="text-3xl font-extrabold text-slate-900 break-words">
                                {race.name}
                            </h1>

                            <span
                                className={`
                                    text-3xl font-extrabold px-2 py-1 rounded
                                    ${race.grade === "GI"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : race.grade === "GII"
                                            ? "bg-pink-100 text-pink-800"
                                            : "bg-green-100 text-green-800"
                                    }
                                `}
                            >
                                {race.grade}
                            </span>
                        </div>
                    </div>

                    <p className="text-slate-600 font-medium ml-1">
                        {race.course.surface} {race.course.distance}
                        {race.course.direction &&
                            `（${race.course.direction}${race.course.courseDetail || ""}）`}
                    </p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                <RaceResultSection result={race.result} />
                <PayoutSection payout={race.result.payout} />
                <CommunityResultSection race={race} />
            </main>
        </div>
    );
}