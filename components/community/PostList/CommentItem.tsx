import { useState } from "react";
import { toggleCommentLike } from "@/lib/db";
import CommentHeader from "./CommentHeader";
import { Comment } from "./types";

type Props = {
    comment: Comment;
    raceId: string;
    postId: string;
    currentUserUid?: string;
    handleDeleteComment: (commentId: string) => void;
};

export default function CommentItem({
    comment,
    raceId,
    postId,
    currentUserUid,
    handleDeleteComment,
}: Props) {
    const [animateLike, setAnimateLike] = useState(false);
    const [floatHearts, setFloatHearts] = useState<number[]>([]);

    const handleLike = () => {
        if (!currentUserUid) return;

        toggleCommentLike(raceId, postId, comment.id, currentUserUid);

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
                currentUserUid={currentUserUid}
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
                    <span>{comment.likes?.includes(currentUserUid ?? "") ? "❤️" : "🤍"}</span>
                    <span>{comment.likes?.length ?? 0}</span>
                </button>

                {floatHearts.map((id) => (
                    <span key={id} className="heart-float text-red-400 absolute left-0 top-0">
                        ❤️
                    </span>
                ))}
            </div>
        </div>
    );
}