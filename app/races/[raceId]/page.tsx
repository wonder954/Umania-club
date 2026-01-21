import { getRace } from "@/lib/races";
import Link from "next/link";
import { notFound } from "next/navigation";
import PredictionForm from "@/components/prediction/PredictionForm";
import PostList from "@/components/community/PostList";

export default async function RacePage({ params }: { params: { raceId: string } }) {
    const race = await getRace(params.raceId);

    if (!race) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            {/* Header */}
            <header className="bg-white shadow sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-gray-500 hover:text-gray-900 font-bold">
                        ← レース一覧
                    </Link>
                    <div className="text-sm font-bold truncate max-w-[200px]">{race.name}</div>
                    <div className="w-20"></div>{/* Spacer */}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
                {/* Race Info Card */}
                <section className="bg-white rounded-lg shadow-md p-6 border-l-8 border-yellow-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                                    {race.grade}
                                </span>
                                <span className="text-gray-500 text-sm">{race.date}</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{race.name}</h1>
                            <p className="text-gray-600 font-medium">
                                {race.course} {race.distance}m {race.track}
                            </p>
                        </div>
                        {/* Weather or other info could go here */}
                    </div>
                </section>

                {/* Prediction Form Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                        あなたの予想
                    </h2>
                    <PredictionForm race={race} />
                </section>

                {/* Community Timeline */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        みんなの予想
                    </h2>
                    <PostList raceId={race.id} race={race} />
                </section>
            </main>
        </div>
    );
}
