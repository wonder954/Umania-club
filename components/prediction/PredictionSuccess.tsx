"use client";

import ShareImageGenerator from "@/components/share/ShareImageGenerator";
import { Race } from "@/lib/races";

type Props = {
    race: Race;
    prediction: Record<string, string>;
    comment: string;
    onReset: () => void;
};

export default function PredictionSuccess({
    race,
    prediction,
    comment,
    onReset,
}: Props) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center transition-all duration-500 ease-in-out">
            <div className="text-5xl mb-4 animate-bounce">🎉</div>

            <h2 className="text-2xl font-bold mb-2">投稿しました！</h2>
            <p className="text-gray-500 mb-6">あなたの予想が公開されました。</p>

            <div className="flex flex-col items-center">
                <ShareImageGenerator
                    raceName={race.name}
                    courseText={`${race.course.surface} ${race.course.distance}（${race.course.direction}${race.course.courseDetail}）`}
                    grade={race.grade || ""}
                    date={race.date || ""}
                    prediction={prediction}
                    horses={race.horses}
                    comment={comment}
                />

                <button
                    onClick={onReset}
                    className="mt-6 text-gray-400 hover:text-gray-600 underline text-sm"
                >
                    新しい予想を投稿する
                </button>
            </div>
        </div>
    );
}