import { Post } from "./types";
import { deletePost } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";

type Props = {
    post: Post;
    currentUserUid?: string;
};

export default function PostHeader({ post, currentUserUid }: Props) {
    const { user } = useAuth();

    const handleDelete = async () => {
        if (!confirm("この投稿を削除しますか？")) return;
        await deletePost(post.raceId, post.id); // raceId が必要なら post に含める
    };

    return (
        <div className="flex items-center gap-2 mb-3">
            <img
                src={post.authorIcon ?? "/profile-icons/default1.png"}
                alt="user icon"
                className="w-8 h-8 rounded-full object-cover border shadow-sm"
            />

            <div className="text-sm font-medium text-gray-800">
                {post.authorName ?? "名無し"}
            </div>

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

            {currentUserUid === post.authorId && (
                <button
                    onClick={handleDelete}
                    className="ml-2 text-red-400 hover:text-red-600 text-xs"
                    title="削除"
                >
                    🗑️
                </button>
            )}
        </div>
    );
}