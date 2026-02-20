"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function GroupsPage() {
    const { user, loading } = useAuth();
    const [groups, setGroups] = useState<any[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!user) return;

        const fetchGroups = async () => {
            const q = query(
                collection(db, "groups"),
                where("members", "array-contains", user.uid)
            );

            const snap = await getDocs(q);

            const list = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setGroups(list);
            setLoadingGroups(false);
        };

        fetchGroups();
    }, [user, loading]); // ← loading を依存に追加するだけ

    if (loading || !user) {
        return <p className="text-center mt-20 text-slate-600">読み込み中...</p>;
    }

    return (
        <div className="max-w-xl mx-auto mt-10 px-4">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-800">グループ一覧</h1>

                <Link
                    href="/groups/create"
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow-sm hover:bg-blue-600 transition"
                >
                    グループ作成
                </Link>
            </div>

            {/* グループ一覧 */}
            <div className="space-y-4">
                {loadingGroups && (
                    <p className="text-center text-slate-500">読み込み中...</p>
                )}

                {!loadingGroups && groups.length === 0 && (
                    <p className="text-center text-slate-500">
                        まだ所属しているグループがありません。
                    </p>
                )}

                {groups.map((g) => (
                    <Link
                        key={g.id}
                        href={`/groups/${g.id}`}
                        className="
                            flex items-center gap-4 
                            bg-white/70 backdrop-blur-sm 
                            p-4 rounded-2xl shadow-sm 
                            border border-white/40 
                            hover:shadow-md hover:bg-white/80 
                            transition
                        "
                    >
                        {/* グループアイコン（未実装ならデフォルト） */}
                        <img
                            src={g.icon ?? "/profile-icons/default1.png"}
                            alt="group icon"
                            className="w-12 h-12 rounded-full border border-white/60 object-cover"
                        />

                        <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">
                                {g.name}
                            </span>
                            <span className="text-sm text-slate-500">
                                メンバー {g.members?.length ?? 0} 人
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}