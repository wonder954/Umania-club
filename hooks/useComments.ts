"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Comment, Post } from "@/components/community/PostList/types";

export function useComments(raceId: string, posts: Post[]) {
    const [comments, setComments] = useState<Record<string, Comment[]>>({});

    useEffect(() => {
        if (posts.length === 0) return;

        const unsubscribes = posts.map((post) => {
            const ref = collection(db, "races", raceId, "posts", post.id, "comments");
            const q = query(ref);

            return onSnapshot(q, (snap) => {
                setComments((prev) => ({
                    ...prev,
                    [post.id]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Comment[],
                }));
            });
        });

        return () => unsubscribes.forEach((u) => u());
    }, [raceId, posts.length]);

    return { comments };
}