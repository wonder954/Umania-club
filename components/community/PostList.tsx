"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { deletePost, addComment, getPostComments } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";

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
                            {Object.entries(post.prediction).map(([horseNum, mark]) => {
                                const horse = race?.horses.find((h: any) => h.number === parseInt(horseNum));
                                return (
                                    <span key={horseNum} className="inline-flex items-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                                        <span className="font-bold mr-1.5 text-lg">{mark}</span>
                                        <span className="text-gray-700 font-mono mr-2">{horseNum}番</span>
                                        {horse && <span className="text-gray-900 font-bold">{horse.name}</span>}
                                    </span>
                                );
                            })}
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
                                    {post.bets.map((bet: any, index: number) => {
                                        // For win/place bets, show horse names
                                        const showHorseName = bet.type === "単勝" || bet.type === "複勝";

                                        return (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                                                    {bet.type}
                                                </span>
                                                {showHorseName && race ? (
                                                    <span className="font-medium text-gray-800">
                                                        {bet.numbers.map((num: number) => {
                                                            const horse = race.horses.find((h: any) => h.number === num);
                                                            return horse ? `${num}.${horse.name}` : num;
                                                        }).join(', ')}
                                                    </span>
                                                ) : (
                                                    <span className="font-mono text-gray-700">
                                                        {bet.numbers.join('-')}
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
