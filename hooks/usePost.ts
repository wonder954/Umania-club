"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Post } from "@/components/community/post/types";

export function usePost(raceId: string, postId: string) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!raceId || !postId) return;

        const fetchPost = async () => {
            const ref = doc(db, "races", raceId, "posts", postId);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
                setPost(null);
                setLoading(false);
                return;
            }

            const data = snap.data();

            let groupName: string | null = null;

            // 🔥 グループ名を取得
            if (data.visibility?.startsWith("group:")) {
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
        };

        fetchPost();
    }, [raceId, postId]);

    return { post, loading };
}