'use client';

import { useEffect, useState } from "react";
import { Comment } from "@/components/community/post/types";
import { getUserProfile } from "@/lib/userCache";
import Link from "next/link"; // ← 追加
import { formatRelativeTime } from "@/utils/formatTime";

type Props = {
    comment: Comment;
    currentUserUid?: string;
    handleDeleteComment: (commentId: string) => void;
};

export default function CommentHeader({ comment, currentUserUid, handleDeleteComment }: Props) {
    const [profile, setProfile] = useState<any>(null);

    // 投稿者プロフィール（キャッシュ使用）
    useEffect(() => {
        getUserProfile(comment.authorId).then(setProfile);
    }, [comment.authorId]);

    return (
        <div className="flex items-center gap-2 mb-1">

            {/* 🔗 アイコン＋名前をまとめてプロフィールページへ */}
            <Link href={`/users/${comment.authorId}`} className="flex items-center gap-2">
                <img
                    src={profile?.icon ?? "/profile-icons/default1.png"}
                    alt="user icon"
                    className="w-6 h-6 rounded-full object-cover border shadow-sm"
                />

                <div className="text-xs font-medium text-gray-800">
                    {profile?.name ?? "名無し"}
                </div>
            </Link>

            {/* 投稿日時 */}
            <span className="text-[10px] text-gray-400 ml-auto">
                {comment.createdAt?.toDate
                    ? formatRelativeTime(comment.createdAt.toDate())
                    : "たった今"}
            </span>

            {/* 削除ボタン */}
            {currentUserUid === comment.authorId && (
                <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="ml-1 text-red-400 hover:text-red-600 text-[10px]"
                >
                    🗑️
                </button>
            )}
        </div>
    );
}