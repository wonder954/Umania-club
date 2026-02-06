import Image from "next/image";
import Link from "next/link";
import { getAllRaces } from "@/lib/races";
import RaceCard from "@/components/race/RaceCard";
import { RaceCalendarSection } from "@/components/calendar/RaceCalendarSection";
import { fetchHolidays } from "@/lib/holidays";
import RaceSearchForm from "@/components/search/RaceSearchForm";

export default async function Home() {
    const holidays = await fetchHolidays();
    const races = await getAllRaces();

    // 現在の日付（JST）
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;

    // 今後のレース
    const upcomingRaces = races
        .filter(r => r.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));

    // 過去レース
    const pastRaces = races
        .filter(r => r.date < today)
        .sort((a, b) => b.date.localeCompare(a.date));

    // カレンダー用
    const calendarRaces = pastRaces;

    // 先週の結果（最新の開催日から3日以内）
    const latestPastDate = pastRaces[0]?.date;
    const lastWeekRaces = latestPastDate
        ? pastRaces.filter(r => {
            const d1 = new Date(latestPastDate);
            const d2 = new Date(r.date);
            const diffTime = Math.abs(d1.getTime() - d2.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 3;
        })
        : [];

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-24 bg-gray-50">
            <div className="w-full max-w-3xl">

                {/* Hero Banner */}
                <div className="mb-10 w-full overflow-hidden rounded-2xl shadow-xl">
                    <Image
                        src="/umania-club%20banner.png"
                        alt="Umania-club Banner"
                        width={800}
                        height={400}
                        className="w-full h-auto object-cover"
                        priority
                    />
                </div>

                {/* Hero Text */}
                <div className="text-center mb-12">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        JRA重賞レース情報をサクッとチェック
                    </h1>
                    <p className="text-gray-600 mb-4">
                        予想投稿・結果をまとめて確認できる競馬アプリ
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link href="#upcoming">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                                今週のレース
                            </button>
                        </Link>
                        <Link href="#calendar">
                            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition">
                                カレンダーを見る
                            </button>
                        </Link>
                    </div>
                </div>

                {/* 今週の重賞レース */}
                <section id="upcoming" className="mb-12 bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-2">今週の重賞レース</h2>
                    <p className="text-gray-500 mb-4">直近で開催される重賞レースをチェック</p>

                    <div className="grid gap-6">
                        {upcomingRaces.length > 0 ? (
                            upcomingRaces.map((race) => (
                                <Link key={race.id} href={`/races/${race.id}`}>
                                    <RaceCard race={race} variant="upcoming" />
                                </Link>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-gray-100 rounded-lg">
                                <p className="text-gray-500">現在予定されているレースはありません</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 先週の結果 */}
                <section className="mb-12 bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-2">先週の重賞レース結果</h2>
                    <p className="text-gray-500 mb-4">直近の開催結果をまとめて確認</p>

                    <div className="grid gap-6">
                        {lastWeekRaces.length > 0 ? (
                            lastWeekRaces.map((race) => (
                                <Link key={race.id} href={`/races/${race.id}`}>
                                    <RaceCard race={race} variant="past" />
                                </Link>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-gray-100 rounded-lg">
                                <p className="text-gray-400">過去のレース履歴はありません</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* レース検索 */}
                <section className="mb-12 bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-4">レースを探す</h2>
                    <RaceSearchForm races={races} />
                </section>

                {/* カレンダー */}
                <section id="calendar" className="mb-12 bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-4">過去のレースカレンダー</h2>
                    <RaceCalendarSection races={calendarRaces} holidays={holidays} />
                </section>

            </div>
        </main>
    );
}