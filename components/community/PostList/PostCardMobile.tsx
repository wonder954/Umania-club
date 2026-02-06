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
        postHit,
        renderNumbers,
    } = props;

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 space-y-6">

            {/* ヘッダー（縦積み） */}
            <PostHeader
                post={post}
                currentUserUid={user?.uid}
                handleDelete={handleDelete}
            />

            {/* ★ Prediction（印）を縦並びにする */}
            <div className="space-y-2">
                <PostPrediction post={post} race={race} vertical />
            </div>


            {/* ★ Bets（買い目）をスマホ向けにカード化 */}
            <PostBets
                post={post}
                race={race}
                expandedBets={expandedBets}
                toggleBets={toggleBets}
                postHit={postHit}
                renderNumbers={renderNumbers}
                vertical   // ← これだけ追加！
            />

            {/* コメント本文 */}
            <PostComment post={post} />

            {/* コメント一覧 */}
            {showComments.has(post.id) && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
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