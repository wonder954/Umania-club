'use client';

import { useEffect, useState } from "react";
import { Post } from "./types";
import { deletePost } from "@/lib/db";
import { getUserProfile } from "@/lib/userCache";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

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

            {/* アイコン＋名前をまとめてリンク */}
            <Link href={`/users/${post.authorId}`} className="flex items-center gap-2">
                <img
                    src={profile?.icon ?? "/profile-icons/default1.png"}
                    alt="user icon"
                    className="w-8 h-8 rounded-full object-cover border shadow-sm"
                />

                <div className="text-sm font-medium text-gray-800">
                    {profile?.name ?? "名無し"}
                </div>
            </Link>

            {/* グループ限定バッジ */}
            {post.visibility?.startsWith("group:") && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {groupName ? `${groupName} 限定` : "グループ限定"}
                </span>
            )}

            {/* 投稿日時 */}
            <div className="text-xs text-gray-400 ml-auto">
                {post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "たった今"}
            </div>

            {/* 削除ボタン */}
            {currentUserUid === post.authorId && (
                <button
                    onClick={handleDelete}
                    className="ml-2 text-red-400 hover:text-red-600 text-xs"
                    title="削除"
                >
                    🗑️
                </button>
            )}
        </div>
    );
}