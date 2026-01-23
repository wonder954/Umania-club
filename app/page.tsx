import Image from "next/image";
import Link from "next/link";
import { getAllRacesFromFirestore } from "@/lib/races-firestore";
import RaceCard from "@/components/race/RaceCard";

export default async function Home() {
    const races = await getAllRacesFromFirestore();

    // 仮の先週のレース結果（UI確認用）
    const pastRaces = [
        {
            id: "20260118tokyo11",
            name: "日経新春杯",
            date: "2026-01-18",
            grade: "G2",
            course: {
                surface: "芝",
                distance: 2400,
                direction: "右",
                courseDetail: null
            },
            place: "京都",
            weightType: "ハンデ",
            round: 11,
            horses: [],
            result: null
        }
    ];

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
                        {races.length > 0 ? (
                            races.map((race) => (
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

                {/* 先週の結果（仮） */}
                <div>
                    <h2 className="text-xl font-bold mb-4">先週の結果</h2>
                    <div className="grid gap-6">
                        {pastRaces.map((race) => (
                            <RaceCard key={race.id} race={race} variant="past" />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}