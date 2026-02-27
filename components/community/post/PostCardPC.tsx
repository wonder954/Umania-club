// PC専用レイアウト

import { useState } from "react";
import { User } from "firebase/auth";
import { Bet } from "@/types/bet";
import { Race } from "@/lib/races";
import { Post, Comment } from "./types";
import PostHeader from "./PostHeader";
import PostPrediction from "./PostPrediction";
import PostBets from "./PostBets";
import PostComment from "../comment/PostComment";
import PostCommentList from "../comment/PostCommentList";
import PostCommentForm from "../comment/PostCommentForm";
import { togglePostLike, addComment } from "@/lib/db";

type Props = {
    post: Post;
    race: Race; // ← パターンAでは必ず存在する
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
    renderNumbers: (bet: Bet, race: Race) => string;

    groupName?: string | null;
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
        groupName,
    } = props;

    const [animateLike, setAnimateLike] = useState(false);
    const [floatHearts, setFloatHearts] = useState<number[]>([]);

    const handleLike = () => {
        if (!user) return;

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
        if (!user) return;

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
        const url = `${window.location.origin}/races/${race.id}/posts/${post.id}`;
        const text = `この投稿を共有します\n${url}`;
        const encoded = encodeURIComponent(text);

        window.open(`https://line.me/R/msg/text/?${encoded}`, "_blank");
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 animate-fadeIn">

            {/* グループ名帯 */}
            {post.visibility?.startsWith("group:") && (
                <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded mb-2">
                    {groupName ? `${groupName} の投稿` : "グループの投稿"}
                </div>
            )}

            <PostHeader post={post} currentUserUid={user?.uid} />

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

            {/* ❤️ いいね & 💬 コメント */}
            <div className="mt-3 flex justify-between items-center text-gray-500 text-sm relative">

                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 transition ${animateLike ? "heart-pop" : ""}`}
                >
                    <span>{post.likes?.includes(user?.uid ?? "") ? "❤️" : "🤍"}</span>
                    <span>{post.likes?.length ?? 0}</span>
                </button>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700"
                >
                    📤 LINE
                </button>

                <button
                    onClick={() => toggleComments(post.id)}
                    className="hover:text-blue-500 transition flex items-center gap-1"
                >
                    💬 {comments.length}
                </button>

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
            {showComments.has(post.id) && (
                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
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