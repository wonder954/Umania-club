"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { Post } from "@/components/community/post/types";
import { useAuth } from "@/context/AuthContext";

export function usePost(raceId: string, postId: string) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const { loading: authLoading, user } = useAuth();

    useEffect(() => {
        if (!raceId || !postId) return;
        if (authLoading) return;

        const ref = doc(db, "races", raceId, "posts", postId);

        // 🔥 Firestore のリアルタイム購読
        const unsub = onSnapshot(ref, async (snap) => {
            if (!snap.exists()) {
                setPost(null);
                setLoading(false);
                return;
            }

            const data = snap.data();

            let groupName: string | null = null;

            // グループ名の取得（ログイン時のみ）
            if (user && data.visibility?.startsWith("group:")) {
                const groupId = data.visibility.replace("group:", "");
                const gref = doc(db, "groups", groupId);
                const gsnap = await getDoc(gref);
                if (gsnap.exists()) {
                    groupName = gsnap.data().name ?? null;
                }
            }

            setPost({
                id: snap.id,
                ...data,
                bets: Array.isArray(data.bets) ? data.bets : [],
                likes: Array.isArray(data.likes) ? data.likes : [],
                prediction: data.prediction ?? {},
                comment: data.comment ?? "",
                visibility: data.visibility ?? "public",
                groupName,
            } as Post);

            setLoading(false);
        });

        return () => unsub();
    }, [raceId, postId, authLoading, user]);

    return { post, loading };
}