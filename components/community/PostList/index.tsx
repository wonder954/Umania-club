//Firestore 読み込み・ロジック

"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { deletePost, addComment, getPostComments } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import type { Bet } from "@/types/bet";
import type { Race } from "@/lib/races";
import { judgeHit } from "@/utils/race/judge";
import { Post, Comment } from "./types";
import PostCard from "./PostCard";

type Props = {
    raceId: string;
    race?: Race;
};

export default function PostList({ raceId, race }: Props) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedBets, setExpandedBets] = useState<Set<string>>(new Set());
    const [showComments, setShowComments] = useState<Set<string>>(new Set());
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [commentText, setCommentText] = useState<Record<string, string>>({});
    const { user } = useAuth();

    useEffect(() => {
        const postsRef = collection(db, "races", raceId, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Post[];

            setPosts(newPosts);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [raceId]);

    const toggleBets = (postId: string) => {
        setExpandedBets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });
    };

    const toggleComments = async (postId: string) => {
        setShowComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            } else {
                newSet.add(postId);
            }
            return newSet;
        });

        // Load comments if not already loaded
        if (!comments[postId]) {
            const postComments = await getPostComments(raceId, postId);
            setComments(prev => ({ ...prev, [postId]: postComments as Comment[] }));
        }
    };

    const handleDelete = async (postId: string) => {
        if (confirm("この投稿を削除しますか？")) {
            try {
                await deletePost(raceId, postId);
            } catch (error) {
                console.error("Delete failed:", error);
                alert("削除に失敗しました");
            }
        }
    };

    const handleAddComment = async (postId: string) => {
        const text = commentText[postId]?.trim();
        if (!text || !user) return;

        try {
            await addComment(raceId, postId, {
                userId: user.uid,
                text
            });

            // Refresh comments
            const postComments = await getPostComments(raceId, postId);
            setComments(prev => ({ ...prev, [postId]: postComments as Comment[] }));
            setCommentText(prev => ({ ...prev, [postId]: "" }));
        } catch (error) {
            console.error("Comment failed:", error);
            alert("コメントの投稿に失敗しました");
        }
    };

    const renderNumbers = (bet: Bet, race?: Race): string => {
        const { type, mode, numbers, formation } = bet;

        // 単勝・複勝 → 馬名付きで表示
        if ((type === "単勝" || type === "複勝") && race) {
            return numbers
                .map((num) => {
                    const horse = race.horses.find((h) => h.number === num);
                    return horse ? `${num}.${horse.name}` : `${num}`;
                })
                .join(", ");
        }

        // BOX
        if (mode === "box") {
            return `BOX: ${numbers.join(", ")}`;
        }

        // 通常
        if (mode === null) {
            return numbers.join(", ");
        }

        // 流し
        if (mode === "nagashi") {
            const axis = numbers.slice(0, 1);
            const wings = numbers.slice(1);
            return `流し: 軸[${axis.join(", ")}] → 相手[${wings.join(", ")}]`;
        }

        // フォーメーション
        if (mode === "formation" && formation) {
            const { first, second, third } = formation;

            // ★ 三連単 → 3段階（順位あり）
            if (type === "3連単") {
                return `フォーメーション: 1着[${first.join(", ")}] → 2着[${second.join(", ")}] → 3着[${third?.join(", ") ?? "-"}]`;
            }

            // ★ 三連複 → 3段階（順位なし）
            if (type === "3連複") {
                return `フォーメーション: 1頭目[${first.join(", ")}] → 2頭目[${second.join(", ")}] → 3頭目[${third?.join(", ") ?? "-"}]`;
            }

            // ★ 馬単・馬連・ワイド → 2段階
            if (["馬単", "馬連", "ワイド"].includes(type)) {
                return `フォーメーション: 1頭目[${first.join(", ")}] → 2頭目[${second.join(", ")}]`;
            }

            // その他（枠連など）
            return `フォーメーション: 1頭目[${first.join(", ")}] → 2頭目[${second.join(", ")}]`;
        }

        // fallback
        return numbers.join(", ");
    };

    if (loading) {
        return <p className="text-center text-gray-500 py-10">読み込み中...</p>;
    }

    if (posts.length === 0) {
        return <p className="text-center text-gray-500 py-10">まだ投稿はありません</p>;
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => {

                let postHit = { isHit: false, payout: 0 };

                if (race?.result) {
                    const results = post.bets.map(bet => judgeHit(bet, race.result!)); // Added ! since race.result is checked
                    const hitOnes = results.filter(r => r.isHit);

                    if (hitOnes.length > 0) {
                        postHit = {
                            isHit: true,
                            payout: hitOnes.reduce((sum, r) => sum + r.payout, 0)
                        };
                    }
                }

                return (
                    <PostCard
                        key={post.id}
                        post={post}
                        race={race}
                        user={user}
                        expandedBets={expandedBets}
                        toggleBets={toggleBets}
                        showComments={showComments}
                        toggleComments={toggleComments}
                        comments={comments[post.id] || []}
                        commentText={commentText[post.id] || ""}
                        setCommentText={(text: string) => setCommentText(prev => ({ ...prev, [post.id]: text }))}
                        handleAddComment={handleAddComment}
                        handleDelete={handleDelete}
                        postHit={postHit}
                        renderNumbers={renderNumbers}
                    />
                );
            })}
        </div>
    );
}
