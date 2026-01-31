"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { deletePost, addComment, getPostComments } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import type { Bet } from "@/types/bet";
import type { Race } from "@/lib/races";
import { judgeHit } from "@/utils/race/judge";
import { expandTickets } from "@/utils/race/expand";

type Post = {
    id: string;
    userId: string;
    prediction: Record<string, string>;
    bets: any[];
    comment: string;
    createdAt: Timestamp;
};

type Comment = {
    id: string;
    userId: string;
    text: string;
    createdAt: Timestamp;
};

type Props = {
    raceId: string;
    race?: any; // Add race data to look up horse names
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
        if (mode === "normal") {
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
            {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow p-4 border border-gray-100 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                            {post.userId.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">
                            {post.userId.substring(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-400 ml-auto">
                            {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : "たった今"}
                        </div>
                        {user && user.uid === post.userId && (
                            <button
                                onClick={() => handleDelete(post.id)}
                                className="ml-2 text-red-400 hover:text-red-600 text-xs"
                                title="削除"
                            >
                                🗑️
                            </button>
                        )}
                    </div>

                    {/* Prediction Marks */}
                    {Object.keys(post.prediction).length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto">
                            {Object.entries(post.prediction)
                                .map(([key, mark]) => {
                                    // key は 馬番 or 馬名
                                    const horse =
                                        race?.horses.find((h: any) => String(h.number) === key) ||
                                        race?.horses.find((h: any) => h.name === key);

                                    return {
                                        mark,
                                        number: horse?.number ?? null,
                                        name: horse?.name ?? key, // 馬名が取れない場合は key をそのまま
                                    };
                                })
                                .sort((a, b) => {
                                    const order: Record<string, number> = {
                                        "◎": 1,
                                        "〇": 2,
                                        "○": 2, // 互換性のため追加
                                        "▲": 3,
                                        "△": 4,
                                    };

                                    // 1. 印の優先順位
                                    const diff = (order[a.mark] || 99) - (order[b.mark] || 99);
                                    if (diff !== 0) return diff;

                                    // 2. 馬番順
                                    return (a.number ?? 999) - (b.number ?? 999);
                                })
                                .map((item) => (
                                    <span
                                        key={`${item.name}-${item.mark}`}
                                        className="inline-flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm whitespace-nowrap"
                                    >
                                        <span className="font-bold mr-1.5 text-lg">
                                            {item.mark === "○" ? "〇" : item.mark}
                                        </span>
                                        {item.number && (
                                            <span className="text-gray-700 font-mono mr-2">{item.number}番</span>
                                        )}
                                        <span className="text-gray-900 font-bold">{item.name}</span>
                                    </span>
                                ))}
                        </div>
                    )}

                    {/* Bets Summary with expand/collapse */}
                    {post.bets && post.bets.length > 0 && (
                        <div className="mb-3">
                            <button
                                onClick={() => toggleBets(post.id)}
                                className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-semibold hover:bg-blue-200 transition"
                            >
                                🎯 買い目 {post.bets.length}点 {expandedBets.has(post.id) ? "▼" : "▶"}
                            </button>

                            {expandedBets.has(post.id) && (
                                <div className="mt-3 space-y-2 bg-blue-50 p-3 rounded-lg">
                                    {post.bets.map((bet: Bet, index: number) => {
                                        const showHorseName = bet.type === "単勝" || bet.type === "複勝";
                                        console.log("=== DEBUG ===");
                                        console.log("bet.type:", bet.type);
                                        console.log("bet.numbers:", bet.numbers);
                                        console.log("expanded:", expandTickets(bet));
                                        console.log("order:", race.result.order.map((o: { number: number }) => o.number));
                                        console.log("judgeHit:", judgeHit(bet, race.result));

                                        // ★ race.result があるときだけ的中判定
                                        let hitInfo = null;
                                        if (race?.result) {
                                            hitInfo = judgeHit(bet, race.result);
                                        }

                                        return (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                                                    {bet.type}
                                                </span>

                                                {showHorseName && race ? (
                                                    <span className="font-medium text-gray-800">
                                                        {bet.numbers
                                                            .map((num: number) => {
                                                                const horse = race.horses.find(
                                                                    (h: any) => h.number === num
                                                                );
                                                                return horse ? `${num}.${horse.name}` : num;
                                                            })
                                                            .join(", ")}
                                                    </span>
                                                ) : (
                                                    <span className="font-mono text-gray-700">
                                                        {renderNumbers(bet, race)}
                                                    </span>
                                                )}

                                                {/* ★ 的中 / 不的中 */}
                                                {hitInfo && (
                                                    <span
                                                        className={`text-xs font-bold px-2 py-1 rounded ${hitInfo.isHit
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-gray-200 text-gray-600"
                                                            }`}
                                                    >
                                                        {hitInfo.isHit
                                                            ? `🎯 的中！ 払戻 ${hitInfo.payout.toLocaleString()}円`
                                                            : "❌ 不的中"}
                                                    </span>
                                                )}

                                                <span className="text-gray-500 text-xs ml-auto">
                                                    {bet.points}点
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Comment */}
                    {post.comment && (
                        <div className="mt-3 mb-2">
                            <p className="text-gray-800 bg-amber-50 border-l-4 border-amber-400 p-3 rounded text-sm italic">
                                "{post.comment}"
                            </p>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm text-gray-400">
                        <button
                            onClick={() => toggleComments(post.id)}
                            className="hover:text-blue-500 transition flex items-center gap-1"
                        >
                            <span>💬</span>
                            <span>コメント ({comments[post.id]?.length || 0})</span>
                        </button>
                    </div>

                    {/* Comments Section */}
                    {showComments.has(post.id) && (
                        <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                            {comments[post.id]?.map((comment) => (
                                <div key={comment.id} className="bg-white p-3 rounded border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-gray-600">
                                            {comment.userId.substring(0, 8)}...
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {comment.createdAt?.toDate?.().toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800">{comment.text}</p>
                                </div>
                            ))}

                            {user ? (
                                <div className="flex gap-2 mt-3">
                                    <input
                                        type="text"
                                        value={commentText[post.id] || ""}
                                        onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                        placeholder="コメントを入力..."
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddComment(post.id);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => handleAddComment(post.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                                    >
                                        送信
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    コメントするにはログインが必要です
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
