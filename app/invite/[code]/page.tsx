"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";

export default function InvitePage() {
    const { code } = useParams();
    const router = useRouter();
    const { user, loginAnonymous } = useAuth();

    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<any>(null);
    const [error, setError] = useState("");

    // 🔥 招待コードからグループを検索
    useEffect(() => {
        const fetchGroup = async () => {
            if (!code) return;

            const q = query(
                collection(db, "groups"),
                where("inviteCode", "==", code)
            );

            const snap = await getDocs(q);

            if (snap.empty) {
                setError("招待コードが無効です。");
                setLoading(false);
                return;
            }

            const g = { id: snap.docs[0].id, ...snap.docs[0].data() };
            setGroup(g);
            setLoading(false);
        };

        fetchGroup();
    }, [code]);

    // 🔥 グループに参加
    const handleJoin = async () => {
        if (!user) {
            await loginAnonymous();
        }

        const currentUser = user;
        if (!currentUser || !group) return;

        const ref = doc(db, "groups", group.id);

        await updateDoc(ref, {
            members: arrayUnion(currentUser.uid),
        });

        alert("グループに参加しました！");
        router.push(`/groups/${group.id}`); // ← ここが重要
    };

    if (loading) {
        return <div className="p-6 text-center">読み込み中...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">{error}</div>;
    }

    const isMember = group.members?.includes(user?.uid);

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-xl font-bold mb-4">グループに参加</h1>

            <p className="text-gray-700">
                グループ名：<span className="font-semibold">{group.name}</span>
            </p>

            {isMember ? (
                <p className="mt-4 text-green-600 font-medium">
                    あなたはすでにこのグループのメンバーです。
                </p>
            ) : (
                <button
                    onClick={handleJoin}
                    className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    このグループに参加する
                </button>
            )}
        </div>
    );
}