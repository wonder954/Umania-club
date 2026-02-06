//PC専用レイアウト

import { User } from "firebase/auth";
import { Bet } from "@/types/bet";
import { Race } from "@/lib/races";
import { Post, Comment } from "./types";
import PostHeader from "./PostHeader";
import PostPrediction from "./PostPrediction";
import PostBets from "./PostBets";
import PostComment from "./PostComment";
import PostCommentList from "./PostCommentList";
import PostCommentForm from "./PostCommentForm";

type Props = {
    post: Post;
    race?: Race;
    user: User | null;
    expandedBets: Set<string>;
    toggleBets: (postId: string) => void;
    showComments: Set<string>;
    toggleComments: (postId: string) => void;
    comments: Comment[];
    commentText: string;
    setCommentText: (text: string) => void;
    handleAddComment: (postId: string) => void;
    handleDelete: (postId: string) => void;
    postHit: { isHit: boolean; payout?: number };
    renderNumbers: (bet: Bet, race?: Race) => string;
};

export default function PostCardPC(props: Props) {
    const {
        post,
        race,
        user,
        expandedBets,
        toggleBets,
        showComments,
        toggleComments,
        comments,
        commentText,
        setCommentText,
        handleAddComment,
        handleDelete,
        postHit,
        renderNumbers,
    } = props;

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 animate-fadeIn">
            <PostHeader
                post={post}
                currentUserUid={user?.uid}
                handleDelete={handleDelete}
            />

            <PostPrediction post={post} race={race} />

            <PostBets
                post={post}
                race={race}
                expandedBets={expandedBets}
                toggleBets={toggleBets}
                postHit={postHit}
                renderNumbers={renderNumbers}
            />

            <PostComment post={post} />

            <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm text-gray-400">
                <button
                    onClick={() => toggleComments(post.id)}
                    className="hover:text-blue-500 transition flex items-center gap-1"
                >
                    <span>💬</span>
                    <span>コメント ({comments?.length || 0})</span>
                </button>
            </div>

            {showComments.has(post.id) && (
                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                    <PostCommentList comments={comments} />
                    <PostCommentForm
                        postId={post.id}
                        user={user}
                        commentText={commentText}
                        setCommentText={setCommentText}
                        handleAddComment={handleAddComment}
                    />
                </div>
            )}
        </div>
    );
}