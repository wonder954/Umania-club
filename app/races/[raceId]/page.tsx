
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

/**
 * レース詳細ページ（サーバーコンポーネント）
 * 
 * - レースデータはサーバーで読み込み
 * - インタラクティブ部分は PredictionSection（クライアント）に委譲
 */
export default async function RacePage({ params }: Props) {
    const race = await getRace(params.raceId);

    if (!race) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
                    <div className="text-6xl mb-4">🏇</div>
                    <h1 className="text-2xl font-bold mb-2">レースが見つかりません</h1>
                    <p className="text-gray-500 mb-6">
                        指定されたレースID: {params.raceId}
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                        レース一覧へ戻る
                    </Link>
                </div>
            </div>
        );
    }

    // グレードに応じたボーダー色
    const gradeBorderColor: Record<string, string> = {
        "GI": "border-yellow-500",
        "GII": "border-pink-500",
        "GIII": "border-green-500",
    };

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
            <section
                className={`bg-white rounded-lg shadow-md p-6 border-l-8 ${gradeBorderColor[race.grade || ""] || "border-gray-400"
                    } w-full max-w-4xl mx-auto mt-6`}
            >
                <div className="flex flex-col gap-4">

                    {/* 1行目：ロゴ + 日付 */}
                    <div className="flex items-center justify-between">
                        <Image
                            src="/umania-club%20logo.png"
                            alt="Umania-club"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                        <span className="text-gray-500 text-sm font-medium">
                            {formatDateWithWeekday(race.date)}
                        </span>
                    </div>


                    {/* 2行目：京都（1行） + 11R（1行） + レース名 + グレード */}
                    <div className="flex items-start gap-2">

                        {/* 左側：京都 + 11R（縦2行・大きく） */}
                        <div className="leading-tight text-lg font-bold text-gray-800 min-w-[42px]">
                            <div>{race.place}</div>
                            <div>{race.raceNumber}</div>
                        </div>


                        {/* 右側：レース名 + グレード（横並び・間隔を詰める） */}
                        <div className="flex items-center gap-1 flex-wrap">
                            <h1 className="text-3xl font-extrabold text-gray-900 break-words">
                                {race.name}
                            </h1>

                            <span
                                className={`text-3xl font-extrabold px-2 py-1 rounded ${race.grade === "GI"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : race.grade === "GII"
                                        ? "bg-pink-100 text-pink-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                            >
                                {race.grade}
                            </span>
                        </div>
                    </div>

                    {/* 3行目：芝 / ダート + 距離 + 向き */}
                    <p className="text-gray-600 font-medium ml-1">
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
                {/* 予想セクション（結果がない場合のみ表示） */}
                {!race.result ? (
                    <>
                        <PredictionArea
                            race={race}
                        />
                        <CommunitySection race={race} />
                    </>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
                        <h3 className="text-lg font-bold text-blue-800 mb-2">レース終了</h3>
                        <p className="text-blue-600">このレースは終了しました。結果をご確認ください。</p>
                    </div>
                )}



                {/* レース結果セクション */}
                {race.result && <RaceResultSection result={race.result} />}

                {/* 払戻金セクション */}
                {race.result && <PayoutSection payout={race.result.payout} />}

                {/* みんなの予想と結果 */}
                {race.result && <CommunityResultSection race={race} />}
            </main>
        </div>
    );
}