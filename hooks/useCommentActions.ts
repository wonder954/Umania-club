"use client";

import { addComment, deleteComment as deleteCommentDb } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";

export function useCommentActions(raceId: string) {
    const { user } = useAuth();

    const add = async (postId: string, text: string) => {
        if (!user || !text.trim()) return;

        // A方式 → コメントには authorId と text だけ保存
        await addComment(raceId, postId, {
            authorId: user.uid,
            text,
        });
    };

    const remove = async (postId: string, commentId: string) => {
        await deleteCommentDb(raceId, postId, commentId);
    };

    return {
        addComment: add,
        deleteComment: remove,
    };
}