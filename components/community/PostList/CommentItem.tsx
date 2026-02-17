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

    return (
        <div className="relative bg-white p-3 rounded border border-gray-200">

            <CommentHeader
                comment={comment}
                currentUserUid={user?.uid}
                handleDeleteComment={handleDeleteComment}
            />

            <p className="text-sm text-gray-800 whitespace-pre-line ml-8">
                {comment.text}
            </p>

            <div className="mt-1 ml-8 flex items-center gap-2 text-xs text-gray-500 relative">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 transition ${animateLike ? "heart-pop" : ""
                        }`}
                >
                    <span>{comment.likes?.includes(user?.uid ?? "") ? "❤️" : "🤍"}</span>
                    <span>{comment.likes?.length ?? 0}</span>
                </button>

                {floatHearts.map((id) => (
                    <span key={id} className="heart-float text-red-400 absolute left-0 top-0">
                        ❤️
                    </span>
                ))}
            </div>

            {/* 返信ボタン */}
            <button
                onClick={() => setReplyTarget(comment.id)}
                className="text-xs text-blue-500 ml-8"
            >
                返信
            </button>

            {/* 返信フォーム */}
            {replyTarget === comment.id && user && (
                <div className="ml-10 mt-2">
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