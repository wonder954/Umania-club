"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, where, getDocs, } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { normalizeGrade, getColorFromGrade } from "@/lib/race/racesToCalendarRaces";
import type { Post } from "@/types/post";

export default function GroupPage() {
    const { groupId } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    const [group, setGroup] = useState<any>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const [memberProfiles, setMemberProfiles] = useState<any[]>([]);

    // 🔥 メンバーの uid → ユーザープロフィールに変換
    useEffect(() => {
        const fetchMembers = async () => {
            if (!group?.members) return;
            if (loading) return; // 追加

            const profiles: any[] = [];

            for (const uid of group.members) {
                const ref = doc(db, "users", uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    profiles.push({ uid, ...snap.data() });
                } else {
                    profiles.push({
                        uid,
                        name: "名無し",
                        icon: "/profile-icons/default1.png",
                    });
                }
            }

            // 🔥 owner → 他メンバー の順に並べる
            const sorted = profiles.sort((a, b) => {
                if (a.uid === group.ownerId) return -1;
                if (b.uid === group.ownerId) return 1;
                return 0;
            });

            setMemberProfiles(sorted);
        };

        fetchMembers();
    }, [group, loading]); // loading 追加

    // 🔥 グループ情報を取得
    useEffect(() => {
        const fetchGroup = async () => {
            if (!user && loading) return; // 追加

            const ref = doc(db, "groups", groupId as string);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setGroup({ id: snap.id, ...snap.data() });
            }
            setLoading(false);
        };
        fetchGroup();
    }, [groupId, user, loading]); // user, loading 追加

    // 🔥 グループ投稿を取得（posts_all 廃止版）
    useEffect(() => {
        const fetchGroupPosts = async () => {
            if (!groupId) return;

            // races コレクション全体を取得
            const racesSnap = await getDocs(collection(db, "races"));

            const allPosts: Post[] = [];

            for (const raceDoc of racesSnap.docs) {
                const raceId = raceDoc.id;

                const postsRef = collection(db, "races", raceId, "posts");
                const q = query(
                    postsRef,
                    where("visibility", "==", `group:${groupId}`),
                    orderBy("createdAt", "desc")
                );

                const snap = await getDocs(q);

                snap.forEach((d) => {
                    const data = d.data();

                    allPosts.push({
                        id: d.id,
                        authorId: data.authorId,
                        authorName: data.authorName ?? "名無し",
                        authorIcon: data.authorIcon ?? "/profile-icons/default1.png",

                        raceId: data.raceId,
                        raceName: data.raceName,

                        visibility: data.visibility,
                        prediction: data.prediction ?? {},
                        bets: data.bets ?? [],

                        comment: data.comment ?? "",
                        createdAt: data.createdAt,
                    });
                });
            }

            // createdAt 降順ソート
            allPosts.sort((a, b) => {
                const aTime = (a as any).createdAt?.seconds ?? 0;
                const bTime = (b as any).createdAt?.seconds ?? 0;
                return bTime - aTime;
            });

            setPosts(allPosts);
        };

        fetchGroupPosts();
    }, [groupId]);

    function getMainHorse(post: Post) {
        const pred = post.prediction;

        if (pred && typeof pred === "object") {
            const entries = Object.entries(pred);
            const main = entries.find(([horse, mark]) => mark === "◎");
            return main ? main[0] : null;
        }

        return null;
    }

    function extractGradeFromRaceName(name: string): string {
        const match = name.match(/G[1-3]/);
        return match ? match[0] : "OP";
    }

    if (loading) {
        return <div className="p-6 text-center">読み込み中...</div>;
    }

    if (!group) {
        return <div className="p-6 text-center text-red-500">グループが見つかりません。</div>;
    }

    const isMember = group.members?.includes(user?.uid);


    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            {/* グループ名 */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <p className="text-sm text-gray-500 mt-1">メンバー数: {group.members?.length}</p>
            </div>

            {/* メンバー一覧 */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-lg font-bold mb-3">
                    メンバー（{memberProfiles.length}人）
                </h2>

                <ul className="space-y-3">
                    {memberProfiles.map((m) => {
                        const isYou = m.uid === user?.uid;
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
                        const mainHorse = getMainHorse(post);

                        const grade = normalizeGrade(extractGradeFromRaceName(post.raceName));
                        const colorClass = getColorFromGrade(grade);

                        return (
                            <Link key={post.id} href={`/races/${post.raceId}/posts/${post.id}`}>
                                <div className="p-4 bg-white rounded-xl shadow cursor-pointer hover:bg-gray-50 transition">

                                    {/* 投稿者情報 */}
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

                                    {/* レース名（カラータグ） */}
                                    <span
                                        className={`inline-block text-sm font-semibold px-3 py-1 rounded-lg ${colorClass}`}
                                    >
                                        {post.raceName}
                                    </span>

                                    {/* ◎馬名 */}
                                    <p className="font-bold mt-2 ml-4 text-blue-700">
                                        {mainHorse ? `◎ ${mainHorse}` : "◎ 予想なし"}
                                    </p>

                                    {/* コメント */}
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

            {/* 退出ボタン（任意） */}
            {isMember && (
                <button className="w-full bg-red-500 text-white py-2 rounded-lg">
                    グループを退出する（未実装）
                </button>
            )}
        </div>
    );
}