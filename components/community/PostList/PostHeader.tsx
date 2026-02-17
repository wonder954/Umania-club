'use client';

import { useEffect, useState } from "react";
import { Post } from "./types";
import { deletePost } from "@/lib/db";
import { getUserProfile } from "@/lib/userCache"; // ★ キャッシュを使う
import { db } from "@/lib/firebase";

type Props = {
    post: Post;
    currentUserUid?: string;
};

export default function PostHeader({ post, currentUserUid }: Props) {
    const [profile, setProfile] = useState<any>(null);

    // 投稿者プロフィールを取得（A方式 + キャッシュ）
    useEffect(() => {
        getUserProfile(post.authorId).then(setProfile);
    }, [post.authorId]);

    const handleDelete = async () => {
        if (!confirm("この投稿を削除しますか？")) return;
        await deletePost(post.raceId, post.id);
    };

    return (
        <div className="flex items-center gap-2 mb-3">

            {/* アイコン（A方式 + キャッシュ） */}
            <img
                src={profile?.icon ?? "/profile-icons/default1.png"}
                alt="user icon"
                className="w-8 h-8 rounded-full object-cover border shadow-sm"
            />

            {/* 名前（A方式 + キャッシュ） */}
            <div className="text-sm font-medium text-gray-800">
                {profile?.name ?? "名無し"}
            </div>

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