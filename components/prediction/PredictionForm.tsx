"use client";
import { useState, useRef, useEffect } from "react";
import BettingForm from "./BettingForm";
import { Bet } from "@/types/bet";
import { createPost } from "@/lib/db";
import { Race } from "@/lib/races";
import { useAuth } from "@/hooks/useAuth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase-auth";
import PredictionSuccess from "./PredictionSuccess";
import { getAllowedNumbers } from "@/utils/bets/getAllowedNumbers";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
    race: Race;
    prediction: Record<string, string>;
    setPrediction: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    bets: Bet[];
    setBets: React.Dispatch<React.SetStateAction<Bet[]>>;
    comment: string;
    setComment: React.Dispatch<React.SetStateAction<string>>;
    onPostSuccess?: () => void;
    onReset?: () => void;
};

export default function PredictionForm({
    race,
    prediction,
    setPrediction,
    bets,
    setBets,
    comment,
    setComment,
    onPostSuccess,
    onReset
}: Props) {
    const { user, loginAnonymous } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const totalPoints = bets.reduce((sum, bet) => sum + (bet.points || 0), 0);

    const allowedNumbers = getAllowedNumbers(prediction, race);

    const addButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (allowedNumbers.length === 7) {
            addButtonRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [allowedNumbers]);

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

        const current = auth.currentUser;

        const snap = await getDoc(doc(db, "users", current.uid));
        const profile = snap.data();

        const postData = {
            authorId: current.uid,
            authorName: profile?.name ?? "名無し",
            authorIcon: profile?.iconUrl ?? "/profile-icons/default1.png",
            visibility: "public",
            prediction,
            bets,
            comment,
            raceId: race.id,
            raceName: race.name
        };

        setIsSubmitting(true);
        try {
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
        onReset?.();
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

    const hasMarks = Object.values(prediction).some(v => v !== "");


    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/40 overflow-hidden">

            {/* Header */}
            <div className="p-4 bg-white/40 backdrop-blur-sm border-b border-white/40 flex justify-between items-center">
                <h2 className="font-bold text-slate-800">予想を入力</h2>
                <div className="text-xs text-slate-500">
                    {user ? `Logged in as ${user.displayName || "Anonymous"}` : "未ログイン"}
                </div>
            </div>

            <div className="p-6 space-y-8">

                {/* Section: Bets */}
                <section>
                    <div ref={addButtonRef}></div>

                    <h3 className="text-lg font-bold border-l-4 border-blue-400 pl-3 mb-4 text-slate-800">
                        買い目
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        ※買い目は、出馬表で印をつけた馬だけ選択できます。
                    </p>

                    {race.horses.some(h => h.number) ? (
                        <>
                            <BettingForm
                                horses={race.horses}
                                bets={bets}
                                onChange={setBets}
                                allowedNumbers={allowedNumbers}
                            />

                            <div className="mt-2 text-right font-bold text-slate-700">
                                合計: {totalPoints} 点
                            </div>
                        </>
                    ) : (
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl text-center border border-white/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-slate-500 pointer-events-none select-none">
                                ?
                            </div>
                            <p className="text-slate-700 font-bold mb-2">出馬表確定待ち</p>
                            <p className="text-sm text-slate-500">
                                枠順・馬番が確定後（金曜日頃）、<br />
                                買い目の入力が可能になります。
                            </p>
                        </div>
                    )}
                </section>

                {/* Section: Comment */}
                <section>
                    <h3 className="text-lg font-bold border-l-4 border-green-400 pl-3 mb-4 text-slate-800">
                        コメント
                    </h3>
                    <textarea
                        className="
                            w-full border border-white/40 rounded-xl p-3 
                            bg-white/60 backdrop-blur-sm
                            focus:outline-none focus:ring-2 focus:ring-green-300
                            text-slate-700
                        "
                        rows={3}
                        placeholder="この馬を選んだ理由は..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={150}
                    />
                    <div className="text-right text-xs text-slate-400 mt-1">
                        {comment.length} / 150
                    </div>
                </section>

                {/* Submit */}
                <div className="pt-4 border-t border-white/40">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !hasMarks}
                        className={`
        w-full py-4 rounded-xl font-bold text-lg shadow-sm transition
        ${isSubmitting || !hasMarks
                                ? "bg-slate-300 cursor-not-allowed text-white"
                                : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transform hover:-translate-y-1"
                            }
    `}
                    >
                        {isSubmitting ? "送信中..." : "予想を投稿する"}
                    </button>


                    {!user && (
                        <p className="text-center text-xs text-slate-500 mt-2">
                            ※投稿すると自動的にゲストログインします
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}