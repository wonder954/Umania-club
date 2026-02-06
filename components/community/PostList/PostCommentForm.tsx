import { User } from "firebase/auth";

type Props = {
    postId: string;
    user: User | null;
    commentText: string;
    setCommentText: (text: string) => void;
    handleAddComment: (postId: string) => void;
};

export default function PostCommentForm({ postId, user, commentText, setCommentText, handleAddComment }: Props) {
    if (!user) {
        return (
            <p className="text-xs text-gray-500 text-center mt-3">
                コメントするにはログインが必要です
            </p>
        );
    }

    return (
        <div className="flex gap-2 mt-3">
            <input
                type="text"
                value={commentText || ""}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="コメントを入力..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleAddComment(postId);
                    }
                }}
            />
            <button
                onClick={() => handleAddComment(postId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
                送信
            </button>
        </div>
    );
}
