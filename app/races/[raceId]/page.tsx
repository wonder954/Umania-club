import { getRace } from "@/lib/races";
import { formatDateWithWeekday } from "@/lib/date";
import Link from "next/link";
import Image from "next/image";
import PredictionArea from "@/components/race/PredictionArea";
import CommunitySection from "@/components/race/CommunitySection";
import CommunityResultSection from "@/components/race/CommunityResultSection";
import RaceResultSection from "@/components/race/RaceResultSection";
import ScrollToPostsButton from "@/components/race/ScrollToPostsButton";
import PayoutSection from "@/components/race/PayoutSection";

type Props = {
    params: { raceId: string };
};

export default async function RacePage({ params }: Props) {
    const race = await getRace(params.raceId);

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

    const gradeBorderColor: Record<string, string> = {
        GI: "border-yellow-400",
        GII: "border-pink-400",
        GIII: "border-green-400",
    };

    return (
        <div className="min-h-screen pb-20 bg-transparent">

            {/* Race Info Card */}
            <section
                className={`
                    bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-6 
                    border-l-8 ${gradeBorderColor[race.grade || ""] || "border-white/40"}
                    border border-white/40
                    w-full max-w-4xl mx-auto mt-6
                `}
            >
                <div className="flex flex-col gap-4">

                    {/* 1行目：ロゴ + 日付 */}
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

                    {/* 2行目：場所 + R + レース名 */}
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

                    {/* 3行目：コース情報 */}
                    <p className="text-slate-600 font-medium ml-1">
                        {race.course.surface} {race.course.distance}
                        {race.course.direction &&
                            `（${race.course.direction}${race.course.courseDetail || ""}）`}
                    </p>
                </div>
            </section>

            {/* みんなの予想へボタン */}
            <div className="max-w-4xl mx-auto mt-4 px-4">
                <ScrollToPostsButton />
            </div>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">

                {/* 予想セクション */}
                {!race.result ? (
                    <>
                        <PredictionArea race={race} />
                        <CommunitySection race={race} />
                    </>
                ) : (
                    <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl p-6 mb-8 text-center shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">レース終了</h3>
                        <p className="text-slate-600">このレースは終了しました。結果をご確認ください。</p>
                    </div>
                )}

                {/* レース結果 */}
                {race.result && <RaceResultSection result={race.result} />}

                {/* 払戻金 */}
                {race.result && <PayoutSection payout={race.result.payout} />}

                {/* みんなの予想と結果 */}
                {race.result && <CommunityResultSection race={race} />}
            </main>
        </div>
    );
}