import Image from "next/image";
import Link from "next/link";
import { getAllFirestoreRaces } from "@/lib/race/firestore";
import RaceCard from "@/components/race/RaceCard";
import { RaceCalendarSection } from "@/components/calendar/RaceCalendarSection";
import { fetchHolidays } from "@/lib/holidays";
import RaceSearchForm from "@/components/search/RaceSearchForm";
import { FlagIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { getWeeklyRaceData } from "@/lib/raceService";
import { toRaceViewModel } from "@/viewmodels/raceViewModel";
import { unifyRaceTitle, matchJraRace } from "@/utils/race/normalize";
import { gradeRaces2026 } from "@/lib/grades2026"; // ← JRA データ取得関数（仮）


export default async function Home() {
    const holidays = await fetchHolidays();
    const fsRaces = await getAllFirestoreRaces();

    // ★ FirestoreRace → JRA 名に統一
    const unified = fsRaces.map(r => {
        const jra = gradeRaces2026.find(j =>
            j.date === r.date && matchJraRace(r.title, j.name)
        );
        return unifyRaceTitle(r, jra);
    });


    // ★ ViewModel 化（titleLabel が短縮される）
    const races = unified.map(toRaceViewModel);

    const {
        upcomingRaces,
        lastWeekRaces,
        calendarRaces,
    } = getWeeklyRaceData(races);


    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-24 bg-transparent">
            <div className="w-full max-w-3xl">

                {/* Hero Banner */}
                <div className="mb-10 w-full overflow-hidden rounded-2xl shadow-md">
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
                    <div className="text-center mb-12 bg-white/40 backdrop-blur-sm rounded-xl p-4">
                        <h1
                            className="
                                flex flex-col md:flex-row
                                items-center justify-center
                                text-center
                                text-2xl font-bold text-slate-800 mb-2
                                leading-tight tracking-tight
                            "
                        >
                            <span>🏇競馬しようぜ🏇</span>
                        </h1>
                        <p className="text-slate-700">
                            🎯仲間内で予想投稿できる競馬アプリ🎯
                        </p>
                    </div>
                    <div className="flex justify-center gap-4">

                        {/* 今週のレース */}
                        <Link href="#upcoming">
                            <div
                                className="
                                    px-4 py-2 rounded-xl 
                                    bg-white/70 backdrop-blur-sm 
                                    text-slate-700 text-sm 
                                    shadow-sm hover:shadow-md 
                                    border border-white/40 
                                    hover:bg-white/80 
                                    transition cursor-pointer 
                                    flex items-center gap-2
                                "
                            >
                                <FlagIcon className="w-5 h-5 text-slate-500" />

                                <div className="flex flex-col md:flex-row leading-[1.3]">
                                    <span>今週の</span>
                                    <span>レース</span>
                                </div>
                            </div>
                        </Link>

                        <Link href="#calendar">
                            <div
                                className="
                                    px-4 py-2 rounded-xl 
                                    bg-white/70 backdrop-blur-sm 
                                    text-slate-700 text-sm 
                                    shadow-sm hover:shadow-md 
                                    border border-white/40 
                                    hover:bg-white/80 
                                    transition cursor-pointer 
                                    flex items-center gap-2
                                "
                            >
                                <CalendarDaysIcon className="w-5 h-5 text-slate-500" />

                                <div className="flex flex-col md:flex-row leading-[1.3]">
                                    <span>カレンダーを</span>
                                    <span>見る</span>
                                </div>
                            </div>
                        </Link>

                    </div>
                </div>

                {/* 今週の重賞レース */}
                <section id="upcoming" className="mb-12 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <img src="/horse-icon.png" alt="" className="w-8 h-8" />
                        今週の重賞レース
                        <img src="/horse-icon.png" alt="" className="w-8 h-8" />
                    </h2>
                    <p className="text-slate-600 mb-4">直近で開催される重賞レースをチェック</p>

                    <div className="grid gap-6">
                        {upcomingRaces.length > 0 ? (
                            upcomingRaces.map((race) => (
                                <Link key={race.id} href={`/races/${race.id}`}>
                                    <RaceCard race={race} variant="upcoming" />
                                </Link>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-white/50 rounded-lg">
                                <p className="text-slate-500">現在予定されているレースはありません</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 先週の結果 */}
                <section className="mb-12 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <img src="/result-icon.png" alt="" className="w-8 h-8" />
                        先週のレース結果
                        <img src="/result-icon.png" alt="" className="w-8 h-8" />
                    </h2>
                    <p className="text-slate-600 mb-4">直近の開催結果をまとめて確認</p>

                    <div className="grid gap-6">
                        {lastWeekRaces.length > 0 ? (
                            lastWeekRaces.map((race) => (
                                <Link key={race.id} href={`/races/${race.id}/result`}>
                                    <RaceCard race={race} variant="past" />
                                </Link>
                            ))
                        ) : (
                            <div className="text-center p-10 bg-white/50 rounded-lg">
                                <p className="text-slate-500">過去のレース履歴はありません</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* レース検索 */}
                <section className="mb-12 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <img src="/search-icon.png" alt="" className="w-8 h-8" />
                        レースを探す
                        <img src="/search-icon.png" alt="" className="w-8 h-8" />
                    </h2>
                    <RaceSearchForm races={races} />
                </section>

                {/* カレンダー */}
                <section id="calendar" className="mb-12 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <img src="/calendar-icon.png" alt="" className="w-8 h-8" />
                        レースカレンダー
                        <img src="/calendar-icon.png" alt="" className="w-8 h-8" />
                    </h2>
                    <RaceCalendarSection races={fsRaces} holidays={holidays} />
                </section>

            </div>
        </main>
    );
}