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
import { judgeHit } from "@/utils/race/judge";

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
    handleDeleteComment: (commentId: string) => void;
    postHit: { isHit: boolean; payout?: number };
    renderNumbers: (bet: Bet, race?: Race) => string;
};

export default function PostCardMobile(props: Props) {
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
        handleDeleteComment,
        postHit,
        renderNumbers,
    } = props;

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 space-y-6">

            {/* 投稿者情報（authorName / authorIcon を直接使用） */}
            <PostHeader
                post={post}
                currentUserUid={user?.uid}
                handleDelete={handleDelete}
            />

            {/* 印（スマホは縦並び） */}
            <div className="space-y-2">
                <PostPrediction post={post} race={race} vertical />
            </div>

            {/* 買い目（スマホはカード化） */}
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

            {/* コメント一覧（開閉） */}
            {showComments.has(post.id) && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <PostCommentList
                        comments={comments}
                        currentUserUid={user?.uid}
                        handleDeleteComment={handleDeleteComment}
                    />

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