import { Post } from "./types";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
    post: Post;
    currentUserUid?: string;
    handleDelete: (postId: string) => void;
};

export default function PostHeader({ post, currentUserUid, handleDelete }: Props) {
    const [author, setAuthor] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const ref = doc(db, "users", post.userId);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setAuthor(snap.data());
            } else {
                setAuthor({
                    name: "名無し",
                    iconUrl: "/profile-icons/default1.png",
                });
            }
        };

        fetchUser();
    }, [post.userId]);

    if (!author) {
        return (
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
                <div className="text-sm text-gray-400">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 mb-3">

            {/* アイコン */}
            <img
                src={author.iconUrl ?? "/profile-icons/default1.png"}
                alt="user icon"
                className="w-8 h-8 rounded-full object-cover border shadow-sm"
            />

            {/* 名前 */}
            <div className="text-sm font-medium text-gray-800">
                {author.name ?? "名無し"}
            </div>

            {/* 投稿日時 */}
            <div className="text-xs text-gray-400 ml-auto">
                {post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "たった今"}
            </div>

            {/* 削除ボタン */}
            {currentUserUid && currentUserUid === post.userId && (
                <button
                    onClick={() => handleDelete(post.id)}
                    className="ml-2 text-red-400 hover:text-red-600 text-xs"
                    title="削除"
                >
                    🗑️
                </button>
            )}
        </div>
    );
}