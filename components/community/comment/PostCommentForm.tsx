"use client";

import { User } from "firebase/auth";
import { signInWithGoogle } from "@/lib/auth";
import { useTextValidation } from "@/hooks/useTextValidation";
import { useState } from "react";

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

    const { validate } = useTextValidation();
    const [error, setError] = useState("");

    const onSubmit = () => {
        const err = validate(commentText);
        if (err) {
            setError(err);
            return;
        }

        setError("");
        handleAddComment(commentText.trim());
        setCommentText("");
    };

    if (!user) {
        return (
            <div className="mt-3 text-center">
                <p className="text-xs text-slate-500 mb-2">
                    コメントするにはログインが必要です
                </p>

                <button
                    onClick={signInWithGoogle}
                    className="
                        px-4 py-2 
                        bg-blue-500 text-white 
                        rounded-xl text-sm font-semibold 
                        shadow-sm 
                        hover:bg-blue-600 
                        transition
                    "
                >
                    ログインしてコメントする
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 mt-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={commentText || ""}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="コメントを入力..."
                    className="
                        flex-1 min-w-0 px-3 py-2
                        bg-white/70 backdrop-blur-sm
                        border border-white/40
                        rounded-xl text-sm
                        text-slate-800
                        focus:outline-none focus:ring-2 focus:ring-blue-300
                        shadow-sm
                    "
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSubmit();
                        }
                    }}
                />

                <button
                    onClick={onSubmit}
                    className="
                        shrink-0 px-4 py-2
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

            {error && (
                <p className="text-red-500 text-xs">{error}</p>
            )}
        </div>
    );
}