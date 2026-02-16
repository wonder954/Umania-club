import { Comment } from "./types";
import CommentItem from "./CommentItem";

type Props = {
    comments?: Comment[];
    currentUserUid?: string;
    handleDeleteComment: (commentId: string) => void;

    // ★ 追加
    raceId: string;
    postId: string;
};

export default function PostCommentList({
    comments,
    currentUserUid,
    handleDeleteComment,
    raceId,
    postId,
}: Props) {
    if (!comments || comments.length === 0) return null;

    return (
        <>
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    raceId={raceId}   // ★ 渡せるようになる
                    postId={postId}   // ★ 渡せるようになる
                    currentUserUid={currentUserUid}
                    handleDeleteComment={handleDeleteComment}
                />
            ))}
        </>
    );
}