"use client";
import { useState, useRef, useEffect } from "react";
import BettingForm from "./BettingForm";
import { Bet } from "@/types/bet";
import { createPost } from "@/lib/db";
import type { FirestoreRace } from "@/lib/race/types";
import { useAuth } from "@/context/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase-auth";
import PredictionSuccess from "./PredictionSuccess";
import { getAllowedNumbers } from "@/utils/bets/getAllowedNumbers";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserGroups } from "@/hooks/useUserGroups";
import { signInWithGoogle } from "@/lib/auth";
import type { Mark } from "@/types/mark";



type Props = {
    race: FirestoreRace;
    prediction: Record<string, Mark>;
    setPrediction: React.Dispatch<React.SetStateAction<Record<string, Mark>>>;
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

    const allowedNumbers = getAllowedNumbers(prediction, race.entries);

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
            alert("投稿にはログインが必要です");
            return;
        }

        // 🔥 投稿直前に最新の race を取得
        const raceSnap = await getDoc(doc(db, "races", race.id));
        const freshRace = raceSnap.data();
        if (!freshRace) {
            alert("レース情報の取得に失敗しました");
            return;
        }

        const finalVisibility =
            visibilityTab === "group"
                ? `group:${selectedGroupId}`
                : "public";

        const postData = {
            authorId: user.uid,
            authorName: user.displayName ?? "名無し",
            authorIcon: user.photoURL ?? "/profile-icons/default1.png",
            visibility: finalVisibility,
            prediction,
            bets,
            comment,

            raceId: race.id,
            raceName: race.title,
            grade: freshRace.grade,
        };

        setIsSubmitting(true);
        try {
            await createPost(race.id, postData);
            setIsSuccess(true);
            onPostSuccess?.();
        } catch (e) {
            console.error("投稿エラー:", e);
            alert("投稿に失敗しました（権限エラー）");
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

    const [visibilityTab, setVisibilityTab] = useState<"public" | "group">("public");
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const { groups } = useUserGroups(user?.uid);

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

                    {race.entries.some(h => h.number) ? (
                        <>
                            <BettingForm
                                horses={race.entries}
                                bets={bets}
                                onChange={setBets}
                                allowedNumbers={allowedNumbers}
                                race={race}
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

                {/* Section: Visibility (公開範囲) */}
                <section>
                    <h3 className="text-lg font-bold border-l-4 border-purple-400 pl-3 mb-4 text-slate-800">
                        公開範囲
                    </h3>

                    {/* 🔥 LINE風タブ */}
                    <div className="flex border-b mb-3">
                        <button
                            onClick={() => {
                                setVisibilityTab("public");
                                setSelectedGroupId(null);
                            }}
                            className={`flex-1 py-2 text-center ${visibilityTab === "public"
                                ? "border-b-2 border-blue-500 text-blue-600 font-bold"
                                : "text-gray-500"
                                }`}
                        >
                            公開
                        </button>

                        <button
                            onClick={() => setVisibilityTab("group")}
                            className={`flex-1 py-2 text-center ${visibilityTab === "group"
                                ? "border-b-2 border-blue-500 text-blue-600 font-bold"
                                : "text-gray-500"
                                }`}
                        >
                            グループ
                        </button>
                    </div>

                    {/* 🔥 グループ一覧 */}
                    {visibilityTab === "group" && (
                        <div className="space-y-2 mb-4">
                            {groups.length === 0 && (
                                <p className="text-sm text-gray-500">参加中のグループがありません</p>
                            )}

                            {groups.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => setSelectedGroupId(g.id)}
                                    className={`w-full text-left px-3 py-2 rounded border ${selectedGroupId === g.id
                                        ? "border-blue-500 bg-blue-50 text-blue-600"
                                        : "border-gray-300 text-gray-700"
                                        }`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Submit */}
                <div className="pt-4 border-t border-white/40">
                    {user ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !hasMarks}
                            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                        >
                            {isSubmitting ? "送信中..." : "予想を投稿する"}
                        </button>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className="w-full py-4 rounded-xl font-bold text-lg bg-blue-500 text-white"
                        >
                            ログインして投稿する
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}