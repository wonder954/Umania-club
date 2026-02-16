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
            setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[]);
            setLoading(false);
        });

        return () => unsub();
    }, [raceId]);

    return { posts, loading };
}