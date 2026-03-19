"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePost } from "@/hooks/usePost";
import { useComments } from "@/hooks/useComments";
import { useCommentActions } from "@/hooks/useCommentActions";
import PostCard from "@/components/community/post/PostCard";
import { judgeHit } from "@/utils/race/judge";
import { useRace } from "@/hooks/useRace";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";

export default function PostDetailPage() {
    const raw = useParams();

    const raceId = Array.isArray(raw.raceId)
        ? raw.raceId[0]
        : String(raw.raceId);

    const postId = Array.isArray(raw.postId)
        ? raw.postId[0]
        : String(raw.postId);

    const { user } = useAuth();

    const { post, loading: postLoading } = usePost(raceId, postId);
    const { race, loading: raceLoading } = useRace(raceId) as {
        race: RaceViewModel | null;
        loading: boolean;
    };

    const { comments } = useComments(raceId, post ? [post] : []);
    const { addComment, deleteComment } = useCommentActions(raceId);

    const [expandedBets, setExpandedBets] = useState(new Set<string>());
    const [showComments, setShowComments] = useState(new Set<string>([postId]));
    const [commentText, setCommentText] = useState("");

    const toggleBets = (id: string) => {
        setExpandedBets(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleComments = (id: string) => {
        setShowComments(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    if (postLoading || raceLoading) {
        return <p className="text-center text-gray-500 py-10">読み込み中...</p>;
    }

    if (!post) {
        return <p className="text-center text-red-500 py-10">投稿が見つかりません</p>;
    }

    if (!race) {
        return <p className="text-center text-red-500 py-10">レース情報が存在しません</p>;
    }

    const postHit = race.result
        ? (post.bets ?? [])
            .map(bet => judgeHit(bet, race.result!))
            .filter(r => r.isHit)
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
                expandedBets={expandedBets}
                toggleBets={toggleBets}
                showComments={showComments}
                toggleComments={toggleComments}
                commentText={commentText}
                setCommentText={setCommentText}
                handleAddComment={(text) => addComment(post.id, text)}
                handleDeleteComment={(commentId) => deleteComment(post.id, commentId)}
                postHit={postHit}
                renderNumbers={() => ""}
                groupName={post.groupName}
            />
        </div>
    );
}