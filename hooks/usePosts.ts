"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Post } from "@/components/community/PostList/types";

export function usePosts(raceId: string) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ref = collection(db, "races", raceId, "posts");
        const q = query(ref, orderBy("createdAt", "desc"));

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map((d) => {
                const data = d.data();

                return {
                    id: d.id,
                    ...data,

                    // 🔥 不足している可能性があるフィールドを補完
                    bets: Array.isArray(data.bets) ? data.bets : [],
                    likes: Array.isArray(data.likes) ? data.likes : [],
                    prediction: data.prediction ?? {},
                    comment: data.comment ?? "",
                } as Post;
            });

            setPosts(list);
            setLoading(false);
        });

        return () => unsub();
    }, [raceId]);

    return { posts, loading };
}