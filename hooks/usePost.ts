"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Post } from "@/components/community/post/types";
import { useAuth } from "@/context/AuthContext";

export function usePost(raceId: string, postId: string) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const { loading: authLoading, user } = useAuth();

    useEffect(() => {
        if (!raceId || !postId) return;
        if (authLoading) return; // 認証確定まで待つ

        let cancelled = false;

        const fetchPost = async () => {
            try {
                const ref = doc(db, "races", raceId, "posts", postId);
                const snap = await getDoc(ref);

                if (cancelled) return;

                if (!snap.exists()) {
                    setPost(null);
                    setLoading(false);
                    return;
                }

                const data = snap.data();

                let groupName: string | null = null;

                // 未ログイン時はグループ情報を取得しない（Firestore Rules: groups は isLoggedIn() 必須）
                if (user && data.visibility?.startsWith("group:")) {
                    const groupId = data.visibility.replace("group:", "");
                    const gref = doc(db, "groups", groupId);
                    const gsnap = await getDoc(gref);
                    if (gsnap.exists()) {
                        groupName = gsnap.data().name ?? null;
                    }
                }

                if (cancelled) return;

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
            } catch (e) {
                if (!cancelled) {
                    console.warn("usePost fetch failed:", e);
                    setPost(null);
                    setLoading(false);
                }
            }
        };

        fetchPost();

        return () => { cancelled = true; };
    }, [raceId, postId, authLoading, user]);

    return { post, loading };
}