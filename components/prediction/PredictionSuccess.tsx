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
        <div
            className="
                bg-white/70 backdrop-blur-sm 
                rounded-2xl p-8 
                text-center 
                shadow-sm border border-white/40
                transition-all duration-500 ease-in-out
            "
        >
            <div className="text-5xl mb-4 animate-bounce">🎉</div>

            <h2 className="text-2xl font-bold mb-2 text-slate-800">
                投稿しました！
            </h2>

            <p className="text-slate-600 mb-6">
                あなたの予想が公開されました。
            </p>

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
                    className="
                        mt-6 text-sm font-semibold 
                        text-blue-600/80 hover:text-blue-700 
                        underline transition
                    "
                >
                    新しい予想を投稿する
                </button>
            </div>
        </div>
    );
}