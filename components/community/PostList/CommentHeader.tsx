import { Comment } from "./types";

type Props = {
    comment: Comment;
    currentUserUid?: string;
    handleDeleteComment: (commentId: string) => void;
};

export default function CommentHeader({ comment, currentUserUid, handleDeleteComment }: Props) {
    return (
        <div className="flex items-center gap-2 mb-1">

            {/* アイコン */}
            <img
                src={comment.authorIcon ?? "/profile-icons/default1.png"}
                alt="user icon"
                className="w-6 h-6 rounded-full object-cover border shadow-sm"
            />

            {/* 名前 */}
            <div className="text-xs font-medium text-gray-800">
                {comment.authorName ?? "名無し"}
            </div>

            {/* 投稿日時 */}
            <div className="text-[10px] text-gray-400 ml-auto">
                {comment.createdAt?.toDate
                    ? comment.createdAt.toDate().toLocaleString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "たった今"}
            </div>

            {/* 削除ボタン */}
            {currentUserUid === comment.authorId && (
                <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="ml-1 text-red-400 hover:text-red-600 text-[10px]"
                >
                    🗑️
                </button>
            )}
        </div>
    );
}