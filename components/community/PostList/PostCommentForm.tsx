import { User } from "firebase/auth";

type Props = {
    user: User | null;
    commentText: string;
    setCommentText: (text: string) => void;
    handleAddComment: (text: string) => void;
};

export default function PostCommentForm({
    user,
    commentText,
    setCommentText,
    handleAddComment,
}: Props) {
    if (!user) {
        return (
            <p className="text-xs text-slate-500 text-center mt-3">
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
                className="
                    flex-1 px-3 py-2 
                    bg-white/70 backdrop-blur-sm
                    border border-white/40 
                    rounded-xl text-sm 
                    text-slate-800
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                    shadow-sm
                "
                onKeyPress={(e) => {
                    if (e.key === "Enter") {
                        handleAddComment(commentText);
                    }
                }}
            />

            <button
                onClick={() => handleAddComment(commentText)}
                className="
                    px-4 py-2 
                    bg-blue-500/80 text-white 
                    rounded-xl text-sm font-semibold 
                    shadow-sm 
                    hover:bg-blue-500/90 
                    transition
                "
            >
                送信
            </button>
        </div>
    );
}