import { User } from "firebase/auth";
import { Comment } from "../post/types";
import CommentItem from "./CommentItem";

type Props = {
    comments?: Comment[];
    user: User | null;
    handleDeleteComment: (commentId: string) => void;

    raceId: string;
    postId: string;

    replyTarget: string | null;
    setReplyTarget: (id: string | null) => void;
    replyText: string;
    setReplyText: (text: string) => void;
    handleAddReply: (text: string, parentId: string) => void;
};

export default function PostCommentList({
    comments,
    user,
    handleDeleteComment,
    raceId,
    postId,
    replyTarget,
    setReplyTarget,
    replyText,
    setReplyText,
    handleAddReply,
}: Props) {
    if (!comments || comments.length === 0) return null;

    // parentId が null のものが root コメント
    const rootComments = comments.filter(c => !c.parentId);

    // 再帰的に子コメントを取得
    const getReplies = (parentId: string) =>
        comments.filter(c => c.parentId === parentId);

    // 再帰描画コンポーネント
    const renderCommentTree = (comment: Comment, depth = 0) => {
        const children = getReplies(comment.id);

        return (
            <div
                key={comment.id}
                className={depth === 0 ? "" : depth === 1 ? "ml-10" : ""} // ★ここがポイント
            >
                <CommentItem
                    comment={comment}
                    raceId={raceId}
                    postId={postId}
                    user={user}
                    handleDeleteComment={handleDeleteComment}
                    replyTarget={replyTarget}
                    setReplyTarget={setReplyTarget}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handleAddReply={handleAddReply}
                />

                {children.map((child) => renderCommentTree(child, depth + 1))}
            </div>
        );
    };

    return <>{rootComments.map(c => renderCommentTree(c))}</>;
}