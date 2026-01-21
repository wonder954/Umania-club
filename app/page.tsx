import Link from "next/link";
import { getAllRaces } from "@/lib/races";

export default async function Home() {
    const races = await getAllRaces();

    return (
        <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gray-50">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-10">
                <h1 className="text-4xl font-bold text-center w-full text-blue-900">Umania-club</h1>
            </div>

            <div className="w-full max-w-3xl">
                <div className="mb-8 text-center">
                    <p className="text-gray-600 text-lg">今週のレース予想に参加しよう</p>
                </div>

                <div className="grid gap-6">
                    {races.length > 0 ? (
                        races.map((race) => (
                            <Link key={race.id} href={`/races/${race.id}`}>
                                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500 cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                            {race.grade}
                                        </span>
                                        <span className="text-gray-500 text-sm">{race.date}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-1 text-gray-800">{race.name}</h2>
                                    <p className="text-gray-600">
                                        {race.course} {race.distance}m {race.track}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center p-10 bg-white rounded-lg shadow">
                            <p className="text-gray-500">現在予定されているレースはありません</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
