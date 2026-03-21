'use client';

import { useEffect, useState } from "react";
import { Post } from "./types";
import { deletePost } from "@/lib/db";
import { getUserProfile } from "@/lib/userCache";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { formatRelativeTime } from "@/utils/formatTime";

type Props = {
    post: Post;
    currentUserUid?: string;
};

export default function PostHeader({ post, currentUserUid }: Props) {
    const [profile, setProfile] = useState<any>(null);
    const [groupName, setGroupName] = useState<string | null>(null);

    // 投稿者プロフィール
    useEffect(() => {
        getUserProfile(post.authorId).then(setProfile);
    }, [post.authorId]);

    // 🔥 グループ名を取得
    useEffect(() => {
        if (!post.visibility?.startsWith("group:")) return;

        const groupId = post.visibility.replace("group:", "");
        const ref = doc(db, "groups", groupId);

        getDoc(ref).then((snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setGroupName(data.name ?? null);
            }
        });
    }, [post.visibility]);

    const handleDelete = async () => {
        if (!confirm("この投稿を削除しますか？")) return;
        await deletePost(post.raceId, post.id);
    };

    return (
        <div className="flex items-center gap-2 mb-3">

            <div className="flex flex-col gap-1 w-full">

                {/* 🔓グループ投稿ラベル */}
                {post.visibility?.startsWith("group:") && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded">
                        🔓 {groupName ? `${groupName} の投稿` : "グループの投稿"}
                    </div>
                )}

                {/* アイコン＋名前＋時間＋削除 */}
                <div className="flex items-center gap-2 w-full">

                    {/* 左側：アイコン＋名前＋時間 */}
                    <Link
                        href={`/users/${post.authorId}`}
                        className="flex items-center gap-1.5 flex-shrink-0"
                    >
                        <img
                            src={profile?.icon ?? "/profile-icons/default1.png"}
                            alt="user icon"
                            className="w-8 h-8 rounded-full object-cover border shadow-sm"
                        />

                        {/* 名前＋時間 */}
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-800 truncate max-w-[110px]">
                                {profile?.name ?? "名無し"}
                            </span>

                            <span className="text-xs text-gray-400">
                                {post.createdAt?.toDate
                                    ? formatRelativeTime(post.createdAt.toDate())
                                    : "たった今"}
                            </span>
                        </div>
                    </Link>

                    {/* 右側：ゴミ箱だけ右端 */}
                    {currentUserUid === post.authorId && (
                        <button
                            onClick={handleDelete}
                            className="ml-auto text-red-400 hover:text-red-600 text-xs"
                            title="削除"
                        >
                            🗑️
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}