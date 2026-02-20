"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { usePosts } from "@/hooks/usePosts";
import { useComments } from "@/hooks/useComments";
import { useCommentActions } from "@/hooks/useCommentActions";
import { judgeHit } from "@/utils/race/judge";
import PostCard from "../post/PostCard";
import type { Bet } from "@/types/bet";
import type { Race } from "@/lib/races";

type Props = {
    raceId: string;
    race?: Race;
};

export default function PostList({ raceId, race }: Props) {
    const { user } = useAuth();   // ← これを追加
    const { posts, loading } = usePosts(raceId, user?.uid);
    const { comments } = useComments(raceId, posts);
    const { addComment, deleteComment } = useCommentActions(raceId);

    const [expandedBets, setExpandedBets] = useState<Set<string>>(new Set());
    const [showComments, setShowComments] = useState<Set<string>>(new Set());
    const [commentText, setCommentText] = useState<Record<string, string>>({});

    const toggleBets = (postId: string) => {
        setExpandedBets((prev) => {
            const s = new Set(prev);
            s.has(postId) ? s.delete(postId) : s.add(postId);
            return s;
        });
    };

    const toggleComments = (postId: string) => {
        setShowComments((prev) => {
            const s = new Set(prev);
            s.has(postId) ? s.delete(postId) : s.add(postId);
            return s;
        });
    };

    const renderNumbers = (bet: Bet, race?: Race): string => {
        const { type, mode, numbers, formation } = bet;

        if ((type === "単勝" || type === "複勝") && race) {
            return numbers
                .map((num) => {
                    const horse = race.horses.find((h) => h.number === num);
                    return horse ? `${num}.${horse.name}` : `${num}`;
                })
                .join(", ");
        }

        if (mode === "box") return `BOX: ${numbers.join(", ")}`;
        if (mode === null) return numbers.join(", ");

        if (mode === "nagashi") {
            const axis = numbers.slice(0, 1);
            const wings = numbers.slice(1);
            return `流し: 軸[${axis.join(", ")}] → 相手[${wings.join(", ")}]`;
        }

        if (mode === "formation" && formation) {
            const { first, second, third } = formation;

            if (type === "3連単") {
                return `フォーメーション: 1着[${first.join(", ")}] → 2着[${second.join(", ")}] → 3着[${third?.join(", ") ?? "-"}]`;
            }

            if (type === "3連複") {
                return `フォーメーション: 1頭目[${first.join(", ")}] → 2頭目[${second.join(", ")}] → 3頭目[${third?.join(", ") ?? "-"}]`;
            }

            if (["馬単", "馬連", "ワイド"].includes(type)) {
                return `フォーメーション: 1頭目[${first.join(", ")}] → 2頭目[${second.join(", ")}]`;
            }
        }

        return numbers.join(", ");
    };

    if (loading) {
        return <p className="text-center text-gray-500 py-10">読み込み中...</p>;
    }

    if (posts.length === 0) {
        return <p className="text-center text-gray-500 py-10">まだ投稿はありません</p>;
    }

    return (
        <div className="relative w-full min-h-fit space-y-6">
            {posts.map((post) => {
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
                    <PostCard
                        key={post.id}
                        post={post}
                        race={race}
                        user={user}
                        comments={comments[post.id] || []}
                        expandedBets={expandedBets}
                        toggleBets={toggleBets}
                        showComments={showComments}
                        toggleComments={toggleComments}
                        commentText={commentText[post.id] || ""}
                        setCommentText={(text) =>
                            setCommentText((prev) => ({ ...prev, [post.id]: text }))
                        }
                        handleAddComment={(text) => {
                            addComment(post.id, text);
                            setCommentText((prev) => ({ ...prev, [post.id]: "" }));
                        }}
                        handleDeleteComment={(commentId) =>
                            deleteComment(post.id, commentId)
                        }
                        postHit={postHit}
                        renderNumbers={renderNumbers}

                        // 🔥 追加：グループ名を渡す
                        groupName={post.groupName}
                    />
                );
            })}
        </div>
    );
}