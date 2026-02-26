"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    collectionGroup,
    query,
    orderBy,
    where,
    getDocs,
    updateDoc,
    arrayRemove,
    arrayUnion
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { normalizeGrade, getColorFromGrade } from "@/lib/race/racesToCalendarRaces";
import type { Post } from "@/types/post";

export default function GroupPage() {
    const { groupId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [group, setGroup] = useState<any>(null);
    const [memberProfiles, setMemberProfiles] = useState<any[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const handleCopyInviteLink = async () => {
        const url = `${window.location.origin}/invite/${group.id}`; await navigator.clipboard.writeText(url);
        alert("招待リンクをコピーしました");
    };
    const handleLeaveGroup = async () => {
        if (!confirm("本当にこのグループを退出しますか？")) return;

        try {
            const ref = doc(db, "groups", group.id);
            await updateDoc(ref, {
                members: arrayRemove(user!.uid)
            });

            alert("グループを退出しました");
            router.push("/groups");
        } catch (e) {
            console.error(e);
            alert("退出に失敗しました");
        }
    };

    // -------------------------------------------------------
    // ① グループ情報を取得（AuthContext が確定してから）
    // -------------------------------------------------------
    useEffect(() => {
        const fetchGroup = async () => {
            if (authLoading) return;     // AuthContext 読み込み中
            if (!user) return;           // 未ログインなら読まない

            const ref = doc(db, "groups", groupId as string);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setGroup({ id: snap.id, ...snap.data() });
            }
        };

        fetchGroup();
    }, [groupId, user, authLoading]);

    // -------------------------------------------------------
    // ② メンバー情報を取得（group が揃ってから）
    // -------------------------------------------------------
    useEffect(() => {
        const fetchMembers = async () => {
            if (!group) return;

            const profiles: any[] = [];

            for (const uid of group.members) {
                const ref = doc(db, "users", uid);
                const snap = await getDoc(ref);

                profiles.push(
                    snap.exists()
                        ? { uid, ...snap.data() }
                        : { uid, name: "名無し", icon: "/profile-icons/default1.png" }
                );
            }

            profiles.sort((a, b) => {
                if (a.uid === group.ownerId) return -1;
                if (b.uid === group.ownerId) return 1;
                return 0;
            });

            setMemberProfiles(profiles);
        };

        fetchMembers();
    }, [group]);

    // -------------------------------------------------------
    // ③ 投稿を取得（group と user が揃ってから）
    // -------------------------------------------------------
    useEffect(() => {
        const fetchPosts = async () => {
            if (authLoading) return;
            if (!user) return;
            if (!group) return;

            const postsRef = collectionGroup(db, "posts");
            const q = query(
                postsRef,
                where("visibility", "==", `group:${groupId}`),
                orderBy("createdAt", "desc")
            );

            const snap = await getDocs(q);

            const list: Post[] = [];

            snap.forEach((d) => {
                const data = d.data();

                // visibility がこのグループのものか確認
                const visibilityGroupId = data.visibility?.split(":")[1];
                const path = d.ref.path; // "races/2606020111/posts/xxxx"
                const raceId = path.split("/")[1];

                if (visibilityGroupId !== groupId) return;

                // 自分がメンバーか確認
                if (!group.members.includes(user.uid)) return;

                list.push({ id: d.id, raceId, ...data } as Post);
            });

            setPosts(list);
        };

        fetchPosts();
    }, [group, user, authLoading]);

    // -------------------------------------------------------
    // ④ UI レンダリング
    // -------------------------------------------------------

    if (authLoading) {
        return <div className="p-6 text-center">読み込み中...</div>;
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto mt-24 bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-sm border border-white/60 text-center space-y-6">
                <h2 className="text-xl font-bold text-slate-800">ログインしてください。</h2>

                <p className="text-slate-600">
                    このグループを表示するにはログインが必要です。
                </p>

                <button
                    onClick={() => router.push("/login")}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl shadow hover:bg-blue-600 transition font-semibold"
                >
                    ログインページへ
                </button>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="max-w-md mx-auto mt-24 bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-sm border border-white/60 text-center space-y-6">
                <h2 className="text-xl font-bold text-slate-800">グループが見つかりません</h2>

                <p className="text-slate-600">
                    招待リンクが無効か、このグループは削除された可能性があります。
                </p>

                <button
                    onClick={() => router.push("/groups")}
                    className="w-full bg-slate-500 text-white py-3 rounded-xl shadow hover:bg-slate-600 transition font-semibold"
                >
                    グループ一覧へ戻る
                </button>
            </div>
        );
    }

    const isMember = group.members?.includes(user.uid);

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">

            {/* グループ名 */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                    メンバー数: {group.members?.length}
                </p>
            </div>

            {/* メンバー一覧 */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-lg font-bold mb-3">
                    メンバー（{memberProfiles.length}人）
                </h2>

                <ul className="space-y-3">
                    {memberProfiles.map((m) => {
                        const isYou = m.uid === user.uid;
                        const isOwner = m.uid === group.ownerId;

                        return (
                            <li
                                key={m.uid}
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => router.push(`/users/${m.uid}`)}
                            >
                                <img
                                    src={m.icon}
                                    className="w-10 h-10 rounded-full border"
                                    alt="icon"
                                />

                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800">
                                        {isYou ? "あなた" : m.name}
                                    </span>

                                    {isOwner && (
                                        <span className="text-xs text-blue-500 font-semibold">
                                            オーナー
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>


            {/* 投稿一覧 */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-lg font-bold mb-3">グループの投稿</h2>

                {posts.length === 0 && (
                    <p className="text-gray-500">まだ投稿がありません。</p>
                )}

                <div className="space-y-4">
                    {posts.map((post) => {
                        const grade = normalizeGrade(extractGradeFromRaceName(post.raceName));
                        const colorClass = getColorFromGrade(grade);

                        return (
                            <Link key={post.id} href={`/races/${post.raceId}/posts/${post.id}`}>
                                <div className="p-4 bg-white rounded-xl shadow cursor-pointer hover:bg-gray-50 transition">

                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={post.authorIcon || "/profile-icons/default1.png"}
                                            className="w-8 h-8 rounded-full border"
                                            alt="icon"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {post.authorName || "名無し"}
                                        </span>
                                    </div>

                                    <span
                                        className={`inline-block text-sm font-semibold px-3 py-1 rounded-lg ${colorClass}`}
                                    >
                                        {post.raceName}
                                    </span>

                                    {post.comment && (
                                        <p className="text-sm text-gray-700 mt-1 ml-9 line-clamp-2">
                                            {post.comment}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 🔥 ここから追加 */}

            {/* 招待（オーナーのみ） */}
            {user.uid === group.ownerId && (
                <button
                    onClick={handleCopyInviteLink}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    招待リンクをコピー
                </button>
            )}

            {/* 退出（メンバーのみ & オーナー以外） */}
            {isMember && user.uid !== group.ownerId && (
                <button
                    onClick={handleLeaveGroup}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                    グループを退出する
                </button>
            )}


        </div>
    );
}

function extractGradeFromRaceName(name: string): string {
    const match = name.match(/G[1-3]/);
    return match ? match[0] : "OP";
}