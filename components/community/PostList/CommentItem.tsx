import { useState } from "react";
import { User } from "firebase/auth";
import { toggleCommentLike } from "@/lib/db";
import CommentHeader from "./CommentHeader";
import { Comment } from "./types";
import PostCommentForm from "./PostCommentForm";

type Props = {
    comment: Comment;
    raceId: string;
    postId: string;
    user: User | null;
    handleDeleteComment: (commentId: string) => void;

    replyTarget: string | null;
    setReplyTarget: (id: string | null) => void;
    replyText: string;
    setReplyText: (text: string) => void;
    handleAddReply: (text: string, parentId: string) => void;
};

export default function CommentItem({
    comment,
    raceId,
    postId,
    user,
    handleDeleteComment,

    replyTarget,
    setReplyTarget,
    replyText,
    setReplyText,
    handleAddReply,
}: Props) {
    const [animateLike, setAnimateLike] = useState(false);
    const [floatHearts, setFloatHearts] = useState<number[]>([]);

    const handleLike = () => {
        if (!user) return;

        toggleCommentLike(raceId, postId, comment.id, user.uid);

        setAnimateLike(true);
        setTimeout(() => setAnimateLike(false), 300);

        const id = Date.now();
        setFloatHearts((prev) => [...prev, id]);
        setTimeout(() => {
            setFloatHearts((prev) => prev.filter((h) => h !== id));
        }, 600);
    };

    const isLiked = comment.likes?.includes(user?.uid ?? "");
    const isReplying = replyTarget === comment.id;

    return (
        <div className="relative bg-white px-4 py-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">

            {/* ヘッダー（アイコン・名前・削除ボタン） */}
            <CommentHeader
                comment={comment}
                currentUserUid={user?.uid}
                handleDeleteComment={handleDeleteComment}
            />

            {/* 本文 */}
            <p className="text-sm text-gray-700 whitespace-pre-line ml-9 mt-2 leading-relaxed">
                {comment.text}
            </p>

            {/* いいね・返信ボタン */}
            <div className="mt-2 ml-9 flex items-center gap-4 text-xs text-gray-400 relative">

                {/* いいね */}
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 transition-transform duration-150 active:scale-90 ${animateLike ? "heart-pop" : ""}`}
                >
                    <span className="text-sm">{isLiked ? "❤️" : "🤍"}</span>
                    <span className={`font-medium tabular-nums ${isLiked ? "text-red-400" : ""}`}>
                        {comment.likes?.length ?? 0}
                    </span>
                </button>

                {/* 返信 */}
                <button
                    onClick={() => setReplyTarget(isReplying ? null : comment.id)}
                    className={`font-medium transition-colors duration-150 ${isReplying ? "text-blue-600" : "text-gray-400 hover:text-blue-500"
                        }`}
                >
                    {isReplying ? "キャンセル" : "返信"}
                </button>

                {/* 浮かぶハート */}
                {floatHearts.map((id) => (
                    <span
                        key={id}
                        className="heart-float text-red-400 absolute left-0 top-0 pointer-events-none select-none"
                    >
                        ❤️
                    </span>
                ))}
            </div>

            {/* 返信フォーム */}
            {isReplying && user && (
                <div className="ml-9 mt-3 pl-4 border-l-2 border-blue-100">
                    <PostCommentForm
                        user={user}
                        commentText={replyText}
                        setCommentText={setReplyText}
                        handleAddComment={(text) => handleAddReply(text, comment.id)}
                    />
                </div>
            )}
        </div>
    );
}