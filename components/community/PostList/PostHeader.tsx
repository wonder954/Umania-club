import { Post } from "./types";

type Props = {
    post: Post;
    currentUserUid?: string;
    handleDelete: (postId: string) => void;
};

export default function PostHeader({ post, currentUserUid, handleDelete }: Props) {
    return (
        <div className="flex items-center gap-2 mb-3">

            {/* アイコン */}
            <img
                src={post.authorIcon ?? "/profile-icons/default1.png"}
                alt="user icon"
                className="w-8 h-8 rounded-full object-cover border shadow-sm"
            />

            {/* 名前 */}
            <div className="text-sm font-medium text-gray-800">
                {post.authorName ?? "名無し"}
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
            {currentUserUid && currentUserUid === post.authorId && (
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