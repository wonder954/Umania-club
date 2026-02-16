// PC専用レイアウト

import { useState } from "react";
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
import { togglePostLike } from "@/lib/db";

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

export default function PostCardPC(props: Props) {
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

    const [animateLike, setAnimateLike] = useState(false);
    const [floatHearts, setFloatHearts] = useState<number[]>([]);

    const handleLike = () => {
        if (!user || !race) return;

        togglePostLike(race.id, post.id, user.uid);

        // ポップアニメーション
        setAnimateLike(true);
        setTimeout(() => setAnimateLike(false), 300);

        // 浮かぶハート
        const id = Date.now();
        setFloatHearts((prev) => [...prev, id]);
        setTimeout(() => {
            setFloatHearts((prev) => prev.filter((h) => h !== id));
        }, 600);
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 animate-fadeIn">

            {/* 投稿者情報 */}
            <PostHeader
                post={post}
                currentUserUid={user?.uid}  // ✅ 修正: 現在ログインしているユーザーのID
            />

            {/* 印 */}
            <PostPrediction post={post} race={race} />

            {/* 買い目 */}
            <PostBets
                post={post}
                race={race}
                expandedBets={expandedBets}
                toggleBets={toggleBets}
                postHit={postHit}
                renderNumbers={renderNumbers}
            />

            {/* 投稿本文 */}
            <PostComment post={post} />

            {/* ❤️ いいね & 💬 コメントボタン */}
            <div className="mt-3 flex justify-between items-center text-gray-500 text-sm relative">

                {/* いいね */}
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 transition ${animateLike ? "heart-pop" : ""}`}
                >
                    <span>{post.likes?.includes(user?.uid ?? "") ? "❤️" : "🤍"}</span>
                    <span>{post.likes?.length ?? 0}</span>
                </button>

                {/* コメントボタン */}
                <button
                    onClick={() => toggleComments(post.id)}
                    className="hover:text-blue-500 transition flex items-center gap-1"
                >
                    💬 {comments.length}
                </button>

                {/* 浮かぶハート */}
                {floatHearts.map((id) => (
                    <span key={id} className="heart-float text-red-400 absolute left-0">❤️</span>
                ))}
            </div>

            {/* コメント開閉 */}
            <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm text-gray-400">
                <button
                    onClick={() => toggleComments(post.id)}
                    className="hover:text-blue-500 transition flex items-center gap-1"
                >
                    <span>💬</span>
                    <span>コメント ({comments?.length || 0})</span>
                </button>
            </div>

            {/* コメント一覧 + 入力欄 */}
            {showComments.has(post.id) && race && (
                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                    <PostCommentList
                        comments={comments}
                        currentUserUid={user?.uid}
                        handleDeleteComment={handleDeleteComment}
                        raceId={race.id}
                        postId={post.id}
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