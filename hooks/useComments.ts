"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Comment, Post } from "@/components/community/post/types";
import { useAuth } from "@/context/AuthContext"; // 追加

export function useComments(raceId: string, posts: Post[]) {
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const { loading: authLoading } = useAuth(); // 追加
    const postIds = posts.map((p) => p.id).join(",");

    useEffect(() => {
        if (posts.length === 0) return;
        if (authLoading) return; // 追加

        const unsubscribes = posts.map((post) => {
            if (!post.id) return () => { };

            const ref = collection(db, "races", raceId, "posts", post.id, "comments");
            const q = query(ref);

            return onSnapshot(q, (snap) => {
                const list = snap.docs.map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        ...data,
                        likes: Array.isArray(data.likes) ? data.likes : [],
                        parentId: data.parentId ?? null,
                    } as Comment;
                });

                setComments((prev) => ({
                    ...prev,
                    [post.id]: list,
                }));
            });
        });

        return () => unsubscribes.forEach((u) => u && u());
    }, [raceId, postIds, authLoading]); // authLoading 追加

    return { comments };
}