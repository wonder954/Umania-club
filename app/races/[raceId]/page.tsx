import { getRace } from "@/lib/races";
import { formatDateWithWeekday } from "@/lib/date";
import Link from "next/link";
import Image from "next/image";
import PredictionSection from "@/components/race/PredictionSection";
import RaceResultSection from "@/components/race/RaceResultSection";

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
            <section className={`bg-white rounded-lg shadow-md p-6 border-l-8 ${gradeBorderColor[race.grade || ""] || "border-gray-400"} w-full max-w-4xl mx-auto mt-6`}>
                <div className="flex flex-col gap-4">

                    {/* 上段：グレード + 日付 */}
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${race.grade === "GI" ? "bg-yellow-100 text-yellow-800" :
                            race.grade === "GII" ? "bg-pink-100 text-pink-800" :
                                "bg-green-100 text-green-800"
                            }`}>
                            {race.grade}
                        </span>
                        <span className="text-gray-500 text-sm">
                            {formatDateWithWeekday(race.date)}
                        </span>

                    </div>

                    {/* 中段：場所 / レース番号 */}
                    {(race.place || race.raceNumber) && (
                        <p className="text-gray-600 text-sm font-medium ml-1">
                            {race.place} {race.raceNumber && `/ ${race.raceNumber}`}
                        </p>
                    )}

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
                        {race.course.surface} {race.course.distance}
                        {race.course.direction && `（${race.course.direction}${race.course.courseDetail || ""}）`}
                    </p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                {/* 予想セクション（結果がない場合のみ表示） */}
                {!race.result ? (
                    <PredictionSection race={race} />
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
                        <h3 className="text-lg font-bold text-blue-800 mb-2">レース終了</h3>
                        <p className="text-blue-600">このレースは終了しました。結果をご確認ください。</p>
                    </div>
                )}

                {/* レース結果セクション（サーバーコンポーネント） */}
                {race.result && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                            レース結果
                        </h2>
                        <RaceResultSection result={race.result} />
                    </section>
                )}
            </main>
        </div>
    );
}