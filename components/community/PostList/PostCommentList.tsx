import { Comment } from "./types";
import CommentHeader from "./CommentHeader";

type Props = {
    comments?: Comment[];
    currentUserUid?: string;
    handleDeleteComment: (commentId: string) => void;
};

export default function PostCommentList({
    comments,
    currentUserUid,
    handleDeleteComment,
}: Props) {
    if (!comments || comments.length === 0) return null;

    return (
        <>
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className="bg-white p-3 rounded border border-gray-200"
                >
                    {/* コメントヘッダー（アイコン・名前・日時・削除） */}
                    <CommentHeader
                        comment={comment}
                        currentUserUid={currentUserUid}
                        handleDeleteComment={handleDeleteComment}
                    />

                    {/* コメント本文 */}
                    <p className="text-sm text-gray-800 whitespace-pre-line ml-8">
                        {comment.text}
                    </p>
                </div>
            ))}
        </>
    );
}