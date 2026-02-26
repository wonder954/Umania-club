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

    // 🔥 groupId から直接グループを取得
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

    // 🔥 グループに参加（ログイン必須）
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

    if (loading) return <div className="p-6 text-center">読み込み中...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    const isMember = user ? group.members?.includes(user.uid) : false;

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-xl font-bold mb-4">グループに参加</h1>

            <p className="text-gray-700">
                グループ名：<span className="font-semibold">{group.name}</span>
            </p>

            {!user && (
                <p className="mt-4 text-red-500 font-medium">
                    参加するにはログインしてください。
                </p>
            )}

            {user && isMember && (
                <p className="mt-4 text-green-600 font-medium">
                    あなたはすでにこのグループのメンバーです。
                </p>
            )}

            {user && !isMember && (
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