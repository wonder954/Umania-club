"use client";
import { useState } from "react";
import MarkSelector from "./MarkSelector";
import BettingForm from "./BettingForm";
import { Bet } from "@/types/bet";
import { createPost } from "@/lib/db";
import { Race } from "@/lib/races";
import { useAuth } from "@/hooks/useAuth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase-auth";
import ShareImageGenerator from "@/components/share/ShareImageGenerator";
import PredictionSuccess from "./PredictionSuccess";
import { getAllowedNumbers } from "@/utils/bets/getAllowedNumbers";

type Props = {
    race: Race;

    // ★ RacePage から受け取る state
    prediction: Record<string, string>;
    setPrediction: React.Dispatch<React.SetStateAction<Record<string, string>>>;

    bets: Bet[];
    setBets: React.Dispatch<React.SetStateAction<Bet[]>>;

    comment: string;
    setComment: React.Dispatch<React.SetStateAction<string>>;

    onPostSuccess?: () => void;
};

export default function PredictionForm({
    race,
    prediction,
    setPrediction,
    bets,
    setBets,
    comment,
    setComment,
    onPostSuccess
}: Props) {
    const { user, loginAnonymous } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const totalPoints = bets.reduce((sum, bet) => sum + (bet.points || 0), 0);

    const allowedNumbers = getAllowedNumbers(prediction, race);

    const handleSubmit = async () => {
        if (!user) {
            await loginAnonymous();

            await new Promise((resolve) => {
                const unsub = onAuthStateChanged(auth, (u) => {
                    if (u) {
                        unsub();
                        resolve(null);
                    }
                });
            });
        }

        if (Object.keys(prediction).length === 0 && bets.length === 0 && !comment) {
            alert("予想、買い目、コメントのいずれかを入力してください");
            return;
        }

        setIsSubmitting(true);
        try {
            const postData = {
                userId: auth.currentUser?.uid || "unknown",
                prediction,
                bets,
                comment,
                raceId: race.id,
                raceName: race.name
            };

            await createPost(race.id, postData);

            setIsSuccess(true);
            onPostSuccess?.();
        } catch (e) {
            console.error(e);
            alert("投稿に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setIsSuccess(false);
        setPrediction({});
        setBets([]);
        setComment("");
    };



    if (isSuccess) {
        return (
            <PredictionSuccess
                race={race}
                prediction={prediction}
                comment={comment}
                onReset={resetForm}
            />
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
                <h2 className="font-bold">予想を入力</h2>
                <div className="text-xs text-gray-300">
                    {user ? `Logged in as ${user.displayName || "Anonymous"}` : "未ログイン"}
                </div>
            </div>

            <div className="p-6 space-y-8">

                {/* Section: Bets */}
                <section>
                    <h3 className="text-lg font-bold border-l-4 border-blue-500 pl-3 mb-4">買い目</h3>

                    {race.horses.some(h => h.number) ? (
                        <>
                            <BettingForm
                                horses={race.horses}
                                bets={bets}
                                onChange={setBets}
                                allowedNumbers={allowedNumbers}   // ← これを追加
                            />
                            <div className="mt-2 text-right font-bold text-gray-700">
                                合計: {totalPoints} 点
                            </div>
                        </>
                    ) : (
                        <div className="bg-gray-100 p-6 rounded-lg text-center border overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-gray-500 pointer-events-none select-none">
                                ?
                            </div>
                            <p className="text-gray-600 font-bold mb-2">出馬表確定待ち</p>
                            <p className="text-sm text-gray-500">
                                枠順・馬番が確定後（金曜日頃）、<br />
                                買い目の入力が可能になります。
                            </p>
                        </div>
                    )}
                </section>

                {/* Section: Comment */}
                <section>
                    <h3 className="text-lg font-bold border-l-4 border-green-500 pl-3 mb-4">コメント</h3>
                    <textarea
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="この馬を選んだ理由は..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={150}
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                        {comment.length} / 150
                    </div>
                </section>

                {/* Submit */}
                <div className="pt-4 border-t">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg transition
              ${isSubmitting
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1"}
            `}
                    >
                        {isSubmitting ? "送信中..." : "予想を投稿する"}
                    </button>
                    {!user && (
                        <p className="text-center text-xs text-gray-500 mt-2">
                            ※投稿すると自動的にゲストログインします
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}