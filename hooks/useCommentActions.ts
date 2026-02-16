"use client";

import { addComment, deleteComment as deleteCommentDb } from "@/lib/db";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export function useCommentActions(raceId: string) {
    const { user } = useAuth();

    const add = async (postId: string, text: string) => {
        if (!user || !text.trim()) return;

        const snap = await getDoc(doc(db, "users", user.uid));
        const profile = snap.data();

        await addComment(raceId, postId, {
            authorId: user.uid,
            authorName: profile?.name ?? "名無し",
            authorIcon: profile?.iconUrl ?? "/profile-icons/default1.png",
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