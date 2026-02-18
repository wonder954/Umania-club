// スマホ専用レイアウト

import { useState } from "react";
import { User } from "firebase/auth";
import { Bet } from "@/types/bet";
import { Race } from "@/lib/races";
import { Post, Comment } from "./types";
import PostHeader from "./PostHeader";
import PostPrediction from "./PostPrediction";
import PostComment from "../comment/PostComment";
import PostCommentList from "../comment/PostCommentList";
import PostCommentForm from "../comment/PostCommentForm";
import PostBets from "./PostBets";
import { togglePostLike, addComment } from "@/lib/db";

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

    // 🔥 追加：グループ名
    groupName?: string | null;
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
        groupName,
    } = props;

    const [animateLike, setAnimateLike] = useState(false);
    const [floatHearts, setFloatHearts] = useState<number[]>([]);

    const handleLike = () => {
        if (!user || !race) return;

        togglePostLike(race.id, post.id, user.uid);

        setAnimateLike(true);
        setTimeout(() => setAnimateLike(false), 300);

        const id = Date.now();
        setFloatHearts((prev) => [...prev, id]);
        setTimeout(() => {
            setFloatHearts((prev) => prev.filter((h) => h !== id));
        }, 600);
    };

    const [replyTarget, setReplyTarget] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    const handleAddReply = async (text: string, parentId: string) => {
        if (!user || !race) return;

        await addComment(race.id, post.id, {
            text,
            authorId: user.uid,
            authorName: user.displayName,
            authorIcon: user.photoURL,
            parentId,
        });

        setReplyText("");
        setReplyTarget(null);
    };

    const handleShare = () => {
        if (!race) return;

        const url = `${window.location.origin}/races/${race.id}/posts/${post.id}`;
        const text = `この投稿を共有します\n${url}`;
        const encoded = encodeURIComponent(text);

        window.open(`https://line.me/R/msg/text/?${encoded}`, "_blank");
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 space-y-6">

            {/* 🔥 グループ名帯（カード全体の文脈） */}
            {post.visibility?.startsWith("group:") && (
                <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded mb-2">
                    {groupName ? `${groupName} の投稿` : "グループの投稿"}
                </div>
            )}

            {/* 投稿者情報 */}
            <PostHeader
                post={post}
                currentUserUid={user?.uid}
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

                {/* 🔥 LINE共有 */}
                <button
                    onClick={handleShare}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700"
                >
                    📤 LINE
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
            {showComments.has(post.id) && race && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <PostCommentList
                        comments={comments}
                        user={user}
                        handleDeleteComment={handleDeleteComment}
                        raceId={race.id}
                        postId={post.id}
                        replyTarget={replyTarget}
                        setReplyTarget={setReplyTarget}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        handleAddReply={handleAddReply}
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