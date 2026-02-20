// app/races/[raceId]/posts/[postId]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/hooks/usePost";
import { useComments } from "@/hooks/useComments";
import { useCommentActions } from "@/hooks/useCommentActions";
import PostCard from "@/components/community/post/PostCard";
import { judgeHit } from "@/utils/race/judge";
import { useRace } from "@/hooks/useRace"; // race を取得する hook がある前提

export default function PostDetailPage() {
    const { raceId, postId } = useParams() as { raceId: string; postId: string };
    const { user } = useAuth();

    // 投稿 1 件を取得
    const { post, loading } = usePost(raceId, postId);

    // レース情報（PostCard に必要）
    const { race } = useRace(raceId);

    // コメント一覧
    const { comments } = useComments(raceId, post ? [post] : []);

    // コメント追加・削除
    const { addComment, deleteComment } = useCommentActions(raceId);

    if (loading || !post) {
        return <p className="text-center text-gray-500 py-10">読み込み中...</p>;
    }

    // 的中判定（PostList と同じロジック）
    const postHit = race?.result
        ? (post.bets ?? [])
            .map((bet) => judgeHit(bet, race.result!))
            .filter((r) => r.isHit)
            .reduce(
                (acc, r) => ({
                    isHit: true,
                    payout: acc.payout + r.payout,
                }),
                { isHit: false, payout: 0 }
            )
        : { isHit: false, payout: 0 };

    return (
        <div className="max-w-2xl mx-auto py-6 px-4">
            <PostCard
                post={post}
                race={race}
                user={user}
                comments={comments[post.id] || []}
                expandedBets={new Set()}
                toggleBets={() => { }}
                showComments={new Set([post.id])} // 詳細ページではコメントを常に開く
                toggleComments={() => { }}
                commentText={""}
                setCommentText={() => { }}
                handleAddComment={(text) => addComment(post.id, text)}
                handleDeleteComment={(commentId) => deleteComment(post.id, commentId)}
                postHit={postHit}
                renderNumbers={() => ""}
                groupName={post.groupName}
            />
        </div>
    );
}