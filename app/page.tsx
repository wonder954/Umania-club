import Image from "next/image";
import Link from "next/link";
import { getAllRaces } from "@/lib/races";
import RaceCard from "@/components/race/RaceCard";
import { RaceCalendarSection } from "@/components/calendar/RaceCalendarSection";
import { fetchHolidays } from "@/lib/holidays";

export default async function Home() {
    const holidays = await fetchHolidays();
    const races = await getAllRaces();

    console.log("HomeRace sample:", races[0]);

    // 現在の日付（JST）
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;

    // 日付で振り分け
    const upcomingRaces = races
        .filter(r => r.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));

    const pastRaces = races
        .filter(r => r.date < today)
        .sort((a, b) => b.date.localeCompare(a.date));

    // ★ カレンダーには Race[] をそのまま渡す
    const calendarRaces = pastRaces;

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

                <div className="mb-8 text-center">
                    <p className="text-gray-600 text-lg font-bold">今週のレース予想に参加しよう</p>
                </div>

                {/* 今週のレース */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-4">今週のレース</h2>
                    <div className="grid gap-6">
                        {upcomingRaces.length > 0 ? (
                            upcomingRaces.map((race) => (
                                <Link key={race.id} href={`/races/${race.id}`}>
                                    <RaceCard race={race} variant="upcoming" />
                                </Link>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-white rounded-lg shadow">
                                <p className="text-gray-500">現在予定されているレースはありません</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 先週の結果 */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-4">先週の結果</h2>
                    <div className="grid gap-6">
                        {pastRaces.length > 0 ? (
                            pastRaces.slice(0, 3).map((race) => (
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
                </div>

                {/* ★ 過去のレースカレンダー */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold mb-4">過去のレースカレンダー</h2>
                    <RaceCalendarSection
                        races={calendarRaces}
                        holidays={holidays}
                    />
                </div>

            </div>
        </main>
    );
}