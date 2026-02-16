"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, getDoc, doc } from "firebase/firestore";
import { deletePost, addComment, getPostComments, deleteComment } from "@/lib/db";
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

    // -----------------------------
    // 投稿一覧の購読
    // -----------------------------
    useEffect(() => {
        const postsRef = collection(db, "races", raceId, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const newPosts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Post[];

                setPosts(newPosts);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching posts:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [raceId]);

    useEffect(() => {
        if (posts.length === 0) return;

        const unsubscribes = posts.map((post) => {
            const commentsRef = collection(db, "races", raceId, "posts", post.id, "comments");
            const q = query(commentsRef);

            return onSnapshot(q, (snapshot) => {
                setComments((prev) => ({
                    ...prev,
                    [post.id]: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Comment[],
                }));
            });
        });

        return () => unsubscribes.forEach((unsub) => unsub());
    }, [raceId, posts.length]);
    // -----------------------------
    // 買い目の開閉
    // -----------------------------
    const toggleBets = (postId: string) => {
        setExpandedBets((prev) => {
            const newSet = new Set(prev);
            newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
            return newSet;
        });
    };

    // -----------------------------
    // コメントの開閉 & 初回ロード
    // -----------------------------
    const toggleComments = (postId: string) => {
        setShowComments((prev) => {
            const newSet = new Set(prev);
            newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
            return newSet;
        });
    };

    // -----------------------------
    // 投稿削除
    // -----------------------------
    const handleDelete = async (postId: string) => {
        if (!confirm("この投稿を削除しますか？")) return;

        try {
            await deletePost(raceId, postId);
        } catch (error) {
            console.error("Delete failed:", error);
            alert("削除に失敗しました");
        }
    };

    // -----------------------------
    // コメント投稿
    // -----------------------------
    const handleAddComment = async (postId: string) => {
        const text = commentText[postId]?.trim();
        if (!text || !user) return;

        try {
            const snap = await getDoc(doc(db, "users", user.uid));
            const profile = snap.data();

            await addComment(raceId, postId, {
                authorId: user.uid,
                authorName: profile?.name ?? "名無し",
                authorIcon: profile?.iconUrl ?? "/profile-icons/default1.png",
                text,
            });

            // ← 再取得は不要
            setCommentText((prev) => ({ ...prev, [postId]: "" }));
        } catch (error) {
            console.error("Comment failed:", error);
            alert("コメントの投稿に失敗しました");
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        if (!confirm("このコメントを削除しますか？")) return;

        try {
            await deleteComment(raceId, postId, commentId);

            // ← 再取得は不要
        } catch (e) {
            console.error("Delete comment failed:", e);
            alert("コメントの削除に失敗しました");
        }
    };

    // -----------------------------
    // 買い目の表示整形
    // -----------------------------
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

            return `フォーメーション: 1頭目[${first.join(", ")}] → 2頭目[${second.join(", ")}]`;
        }

        return numbers.join(", ");
    };

    // -----------------------------
    // UI
    // -----------------------------
    if (loading) {
        return <p className="text-center text-gray-500 py-10">読み込み中...</p>;
    }

    if (posts.length === 0) {
        return <p className="text-center text-gray-500 py-10">まだ投稿はありません</p>;
    }

    return (
        <div className="relative w-full min-h-fit space-y-6">
            {posts.map((post) => {
                let postHit = { isHit: false, payout: 0 };

                if (race?.result) {
                    const results = post.bets.map((bet) => judgeHit(bet, race.result!));
                    const hitOnes = results.filter((r) => r.isHit);

                    if (hitOnes.length > 0) {
                        postHit = {
                            isHit: true,
                            payout: hitOnes.reduce((sum, r) => sum + r.payout, 0),
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
                        setCommentText={(text: string) =>
                            setCommentText((prev) => ({ ...prev, [post.id]: text }))
                        }
                        handleAddComment={handleAddComment}
                        handleDelete={handleDelete}
                        handleDeleteComment={(commentId) => handleDeleteComment(post.id, commentId)}
                        postHit={postHit}
                        renderNumbers={renderNumbers}
                    />
                );
            })}
        </div>
    );
}