"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

export default function InvitePage() {
    const { code } = useParams(); // code = groupId
    const router = useRouter();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<any>(null);
    const [error, setError] = useState("");

    const groupId = Array.isArray(code) ? code[0] : code;

    // グループ情報取得
    useEffect(() => {
        const fetchGroup = async () => {
            if (!groupId) return;

            const ref = doc(db, "groups", groupId);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
                setError("招待リンクが無効です。");
                setLoading(false);
                return;
            }

            setGroup({ id: snap.id, ...snap.data() });
            setLoading(false);
        };

        fetchGroup();
    }, [groupId]);

    // グループ参加
    const handleJoin = async () => {
        if (!user) {
            alert("参加するにはログインが必要です。");
            return;
        }

        const ref = doc(db, "groups", group.id);

        await updateDoc(ref, {
            members: arrayUnion(user.uid),
        });

        alert("グループに参加しました！");
        router.push(`/groups/${group.id}`);
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-slate-600">
                読み込み中...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-24 bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-sm border border-white/60 text-center space-y-4">
                <p className="text-slate-700 font-medium">{error}</p>
                <button
                    onClick={() => router.push("/")}
                    className="w-full bg-blue-500/90 text-white py-3 rounded-xl shadow-sm hover:bg-blue-600 transition font-semibold"
                >
                    ホームへ戻る
                </button>
            </div>
        );
    }

    const isMember = user ? group.members?.includes(user.uid) : false;

    return (
        <div className="flex justify-center">
            <div className="max-w-md w-full mt-20 bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-sm border border-white/60 space-y-6">

                <h1 className="text-2xl font-bold text-slate-800 text-center">
                    グループに参加
                </h1>

                <p className="text-slate-700 text-center">
                    グループ名：<span className="font-semibold">{group.name}</span>
                </p>

                {!user && (
                    <p className="mt-4 text-red-500 font-medium text-center">
                        参加するにはログインしてください。
                    </p>
                )}

                {user && isMember && (
                    <p className="mt-4 text-green-600 font-medium text-center">
                        あなたはすでにこのグループのメンバーです。
                    </p>
                )}

                {user && !isMember && (
                    <button
                        onClick={handleJoin}
                        className="
                            w-full bg-blue-500/90 text-white py-3 rounded-xl
                            shadow-sm hover:bg-blue-600 transition font-semibold
                        "
                    >
                        このグループに参加する
                    </button>
                )}
            </div>
        </div>
    );
}