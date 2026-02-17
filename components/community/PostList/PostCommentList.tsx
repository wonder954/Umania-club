import { User } from "firebase/auth";
import { Comment } from "./types";
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

    // 親コメントと返信コメントを分離
    const parents = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);

    const getReplies = (parentId: string) =>
        replies.filter(r => r.parentId === parentId);

    return (
        <>
            {parents.map(parent => (
                <div key={parent.id}>
                    <CommentItem
                        comment={parent}
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

                    {/* 返信コメント */}
                    {getReplies(parent.id).map(reply => (
                        <div key={reply.id} className="ml-10">
                            <CommentItem
                                comment={reply}
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
                        </div>
                    ))}
                </div>
            ))}
        </>
    );
}