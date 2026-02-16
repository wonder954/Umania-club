//スマホ専用レイアウト

import { User } from "firebase/auth";
import { Bet } from "@/types/bet";
import { Race } from "@/lib/races";
import { Post, Comment } from "./types";
import PostHeader from "./PostHeader";
import PostPrediction from "./PostPrediction";
import PostComment from "./PostComment";
import PostCommentList from "./PostCommentList";
import PostCommentForm from "./PostCommentForm";
import PostBets from "./PostBets";

type Props = {
    post: Post;
    race?: Race;
    user: User | null;
    comments: Comment[];
    expandedBets: Set<string>;
    toggleBets: (postId: string) => void;
    showComments: Set<string>;
    toggleComments: (postId: string) => void;
    commentText: string;
    setCommentText: (text: string) => void;
    handleAddComment: (text: string) => void;
    handleDeleteComment: (commentId: string) => void;
    postHit: { isHit: boolean; payout?: number };
    renderNumbers: (bet: Bet, race?: Race) => string;
};

export default function PostCardMobile(props: Props) {
    const {
        post,
        race,
        user,
        comments,
        expandedBets,
        toggleBets,
        showComments,
        toggleComments,
        commentText,
        setCommentText,
        handleAddComment,
        handleDeleteComment,
        postHit,
        renderNumbers,
    } = props;

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 space-y-6">

            {/* 投稿者情報 */}
            <PostHeader
                post={post}
                currentUserUid={user?.uid}
            // 投稿削除は PostHeader 内で完結
            />

            {/* 印 */}
            <div className="space-y-2">
                <PostPrediction post={post} race={race} vertical />
            </div>

            {/* 買い目 */}
            <PostBets
                post={post}
                race={race}
                expandedBets={expandedBets}
                toggleBets={toggleBets}
                postHit={postHit}
                renderNumbers={renderNumbers}
                vertical
            />

            {/* コメント本文 */}
            <PostComment post={post} />

            {/* コメントボタン */}
            <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm text-gray-400">
                <button
                    onClick={() => toggleComments(post.id)}
                    className="hover:text-blue-500 transition flex items-center gap-1"
                >
                    <span>💬</span>
                    <span>コメント ({comments?.length || 0})</span>
                </button>
            </div>

            {/* コメント一覧 */}
            {showComments.has(post.id) && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <PostCommentList
                        comments={comments}
                        currentUserUid={user?.uid}
                        handleDeleteComment={handleDeleteComment}
                    />

                    <PostCommentForm
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