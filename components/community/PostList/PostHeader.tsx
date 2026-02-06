import { Post } from "./types";
import { Race } from "@/lib/races";

type Props = {
    post: Post;
    currentUserUid?: string;
    handleDelete: (postId: string) => void;
};

export default function PostHeader({ post, currentUserUid, handleDelete }: Props) {
    return (
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
