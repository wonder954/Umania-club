"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { Post } from "@/components/community/post/types";
import { useUserGroups } from "@/hooks/useUserGroups";

export function usePosts(raceId: string, userId?: string) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔥 ユーザーが所属しているグループ一覧
    const { groups } = useUserGroups(userId);
    const allowedGroupIds = groups.map((g) => g.id);

    useEffect(() => {
        const ref = collection(db, "races", raceId, "posts");
        const q = query(ref, orderBy("createdAt", "desc"));

        const unsub = onSnapshot(q, async (snap) => {
            const list = await Promise.all(
                snap.docs.map(async (d) => {
                    const data = d.data();

                    let groupName: string | null = null;

                    // 🔥 visibility が group:xxx の場合は groupName を取得
                    if (data.visibility?.startsWith("group:")) {
                        const groupId = data.visibility.replace("group:", "");
                        const gref = doc(db, "groups", groupId);
                        const gsnap = await getDoc(gref);
                        if (gsnap.exists()) {
                            groupName = gsnap.data().name ?? null;
                        }
                    }

                    return {
                        id: d.id,
                        ...data,

                        bets: Array.isArray(data.bets) ? data.bets : [],
                        likes: Array.isArray(data.likes) ? data.likes : [],
                        prediction: data.prediction ?? {},
                        comment: data.comment ?? "",
                        visibility: data.visibility ?? "public",

                        // 🔥 追加：PostCardMobile に渡すための groupName
                        groupName,
                    } as Post;
                })
            );

            // 🔥 visibility に応じてフィルタリング
            const filtered = list.filter((post) => {
                const v = post.visibility;

                if (v === "public") return true;

                if (v.startsWith("group:")) {
                    const groupId = v.replace("group:", "");
                    return allowedGroupIds.includes(groupId);
                }

                return false;
            });

            setPosts(filtered);
            setLoading(false);
        });

        return () => unsub();
    }, [raceId, allowedGroupIds.join(",")]);

    return { posts, loading };
}