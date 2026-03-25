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
    deleteDoc,
    arrayRemove,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import type { Post } from "@/types/post";

import { toRaceViewModel } from "@/viewmodels/raceViewModel";
import { unifyRaceTitle, matchJraRace } from "@/utils/race/normalize";
import { gradeRaces2026 } from "@/lib/grades2026"; // ← JRA データ取得関数（仮）
import type { RaceViewModel } from "@/viewmodels/raceViewModel";

import GroupHeader from "@/components/group/GroupHeader";
import GroupMemberList from "@/components/group/GroupMemberList";
import GroupPostList from "@/components/group/GroupPostList";

export default function GroupPage() {
    const { groupId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [group, setGroup] = useState<any>(null);
    const [memberProfiles, setMemberProfiles] = useState<any[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [fsRaces, setFsRaces] = useState<any[]>([]);

    // 招待リンクをコピー
    const handleCopyInviteLink = async () => {
        const url = `${window.location.origin}/invite/${group.id}`;
        await navigator.clipboard.writeText(url);
        alert("招待リンクをコピーしました");
    };

    // グループを退出
    const handleLeaveGroup = async () => {
        if (!confirm("本当にこのグループを退出しますか？")) return;
        try {
            const ref = doc(db, "groups", group.id);
            await updateDoc(ref, { members: arrayRemove(user!.uid) });
            alert("グループを退出しました");
            router.push("/groups");
        } catch (e) {
            console.error(e);
            alert("退出に失敗しました");
        }
    };

    //グループを削除
    const handleDeleteGroup = async () => {
        if (!confirm("本当にこのグループを削除しますか？\n投稿やメンバー情報もすべて消えます。")) return;

        try {
            await deleteDoc(doc(db, "groups", group.id));
            alert("グループを削除しました");
            router.push("/groups");
        } catch (e) {
            console.error(e);
            alert("削除に失敗しました");
        }
    };

    // ① グループ情報を取得
    useEffect(() => {
        const fetchGroup = async () => {
            if (authLoading) return;
            if (!user) return;

            const ref = doc(db, "groups", groupId as string);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setGroup({ id: snap.id, ...snap.data() });
            }
        };
        fetchGroup();
    }, [groupId, user, authLoading]);

    // ② メンバー情報を取得
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

    // ③ 投稿を取得
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
                const visibilityGroupId = data.visibility?.split(":")[1];
                const raceId = d.ref.path.split("/")[1];

                if (visibilityGroupId !== groupId) return;
                if (!group.members.includes(user.uid)) return;

                list.push({ id: d.id, raceId, ...data } as Post);
            });

            setPosts(list);
        };
        fetchPosts();
    }, [group, user, authLoading]);

    // ④ レース一覧を取得
    useEffect(() => {
        const fetchRaces = async () => {
            const q = query(collectionGroup(db, "races"));
            const snap = await getDocs(q);

            const list: any[] = [];
            snap.forEach((d) => {
                list.push({ id: d.id, ...d.data() });
            });

            setFsRaces(list);
        };

        fetchRaces();
    }, []);

    // ローディング中
    if (authLoading) {
        return <div className="p-6 text-center">読み込み中...</div>;
    }

    // 未ログイン
    if (!user) {
        return (
            <div className="max-w-md mx-auto mt-24 bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-sm border border-white/60 text-center space-y-6">
                <h2 className="text-xl font-bold text-slate-800">ログインしてください。</h2>
                <p className="text-slate-600">このグループを表示するにはログインが必要です。</p>
                <button
                    onClick={() => router.push("/login")}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl shadow hover:bg-blue-600 transition font-semibold"
                >
                    ログインページへ
                </button>
            </div>
        );
    }

    // グループが見つからない
    if (!group) {
        return (
            <div className="max-w-md mx-auto mt-24 bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-sm border border-white/60 text-center space-y-6">
                <h2 className="text-xl font-bold text-slate-800">グループが見つかりません</h2>
                <p className="text-slate-600">招待リンクが無効か、このグループは削除された可能性があります。</p>
                <button
                    onClick={() => router.push("/groups")}
                    className="w-full bg-slate-500 text-white py-3 rounded-xl shadow hover:bg-slate-600 transition font-semibold"
                >
                    グループ一覧へ戻る
                </button>
            </div>
        );
    }

    // ★ fsRaces がまだなら待つ
    if (fsRaces.length === 0) {
        return <div className="p-6 text-center">レース情報を読み込み中...</div>;
    }

    // ★ raceMap を作る
    const raceMap: Record<string, RaceViewModel> = {};

    for (const fsRace of fsRaces) {
        const jra = gradeRaces2026.find(
            (j) => j.date === fsRace.date && matchJraRace(fsRace.title, j.name)
        );

        const unified = unifyRaceTitle(fsRace, jra);
        const vm = toRaceViewModel(unified);

        raceMap[fsRace.id] = vm;
    }

    const isMember = group.members?.includes(user.uid);

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/60">
                <GroupHeader name={group.name} memberCount={group.members?.length} />
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/60">
                <GroupMemberList
                    members={memberProfiles}
                    currentUserId={user.uid}
                    ownerId={group.ownerId}
                />
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/60">
                <GroupPostList posts={posts} raceMap={raceMap} />
            </div>

            {/* 招待ボタン（オーナーのみ） */}
            {user.uid === group.ownerId && (
                <div className="space-y-3">
                    {/* 招待リンクコピー */}
                    <button
                        onClick={handleCopyInviteLink}
                        className="w-full bg-blue-500/90 text-white py-3 rounded-xl shadow-sm hover:bg-blue-600 transition font-semibold"
                    >
                        招待リンクをコピー
                    </button>

                    {/* LINEで送る */}
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/invite/${group.id}`;
                            const encoded = encodeURIComponent(`このグループに参加しませんか？\n${url}`);
                            window.location.href = `https://line.me/R/msg/text/?${encoded}`;
                        }}
                        className="
                w-full py-3 rounded-xl shadow-sm
                bg-green-500/90 text-white
                hover:bg-green-600 transition font-semibold
            "
                    >
                        LINEで招待リンクを送る
                    </button>
                </div>
            )}


            {/* 退出ボタン（メンバーのみ・オーナー以外） */}
            {isMember && user.uid !== group.ownerId && (
                <button
                    onClick={handleLeaveGroup}
                    className="w-full bg-red-500/90 text-white py-3 rounded-xl shadow-sm hover:bg-red-600 transition font-semibold"
                >
                    グループを退出する
                </button>
            )}

            {/* グループ削除ボタン（オーナーのみ） */}
            {user.uid === group.ownerId && (
                <button
                    onClick={handleDeleteGroup}
                    className="w-full bg-red-600/90 text-white py-3 rounded-xl shadow-sm hover:bg-red-700 transition font-semibold"
                >
                    グループを削除する
                </button>
            )}


        </div>
    );
}