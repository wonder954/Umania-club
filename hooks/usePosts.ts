"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    where,
    doc,
    getDoc,
    QueryDocumentSnapshot,
    DocumentData,
} from "firebase/firestore";
import { Post } from "@/components/community/post/types";
import { useUserGroups } from "@/hooks/useUserGroups";
import { useAuth } from "@/context/AuthContext";

export function usePosts(raceId: string, userId?: string) {
    const [rawPosts, setRawPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { loading: authLoading, user } = useAuth();

    const { groups, loading: groupsLoading } = useUserGroups(userId);
    const allowedGroupIds = useMemo(() => groups.map((g) => g.id), [groups]);

    const groupNameCache = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        if (!raceId) {
            console.log("⏸ raceId がまだ undefined のため、Firestore 読み込みを停止");
            return;
        }

        if (authLoading) return;

        const ref = collection(db, "races", raceId, "posts");

        // ────────────────────────────────
        // 未ログイン → where を使わない（重要）
        // ────────────────────────────────
        if (!user) {
            const q = query(ref, orderBy("createdAt", "desc"));

            const unsub = onSnapshot(
                q,
                (snap) => {
                    const list = snap.docs
                        .map((d) => ({ id: d.id, ...d.data() } as Post))
                        .filter((p) => p.visibility === "public"); // ← クライアント側で public のみ

                    setRawPosts(list);
                    setLoading(false);
                },
                (error) => {
                    console.error("usePosts (unauthenticated) error:", error);
                    setLoading(false);
                }
            );

            return () => unsub();
        }

        // ────────────────────────────────
        // ログイン済み → public + 自分の投稿
        // ────────────────────────────────
        const qPublic = query(
            ref,
            where("visibility", "==", "public"),
            orderBy("createdAt", "desc")
        );

        const qOwn = query(
            ref,
            where("authorId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        let publicPosts: Post[] = [];
        let ownPosts: Post[] = [];

        const mapDoc = (d: QueryDocumentSnapshot<DocumentData>): Post => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
            } as Post;
        };

        const mergeAndUpdate = async (pub: Post[], own: Post[]) => {
            const map = new Map<string, Post>();
            for (const p of [...pub, ...own]) map.set(p.id, p);

            const merged = await Promise.all(
                Array.from(map.values()).map(async (post) => {
                    let groupName: string | null = null;

                    if (post.visibility?.startsWith("group:")) {
                        const groupId = post.visibility.replace("group:", "");

                        // 未ログインならスキップ
                        if (!user) {
                            return { ...post, groupName: null };
                        }

                        if (groupNameCache.current.has(groupId)) {
                            groupName = groupNameCache.current.get(groupId) ?? null;
                        } else {
                            try {
                                const gsnap = await getDoc(doc(db, "groups", groupId));
                                if (gsnap.exists()) {
                                    groupName = gsnap.data().name ?? null;
                                    groupNameCache.current.set(groupId, groupName ?? "");
                                }
                            } catch (e) {
                                console.warn(`Group fetch failed for ${groupId}:`, e);
                            }
                        }
                    }

                    return { ...post, groupName };
                })
            );

            merged.sort((a, b) => {
                const aTime = (a as any).createdAt?.seconds ?? 0;
                const bTime = (b as any).createdAt?.seconds ?? 0;
                return bTime - aTime;
            });

            setRawPosts(merged);
            setLoading(false);
        };

        const unsubPublic = onSnapshot(
            qPublic,
            (snap) => {
                publicPosts = snap.docs.map(mapDoc);
                mergeAndUpdate(publicPosts, ownPosts);
            },
            (error) => {
                console.error("usePosts public error:", error);
                setLoading(false);
            }
        );

        const unsubOwn = onSnapshot(
            qOwn,
            (snap) => {
                ownPosts = snap.docs.map(mapDoc);
                mergeAndUpdate(publicPosts, ownPosts);
            },
            (error) => {
                console.error("usePosts own error:", error);
                setLoading(false);
            }
        );

        return () => {
            unsubPublic();
            unsubOwn();
        };
    }, [raceId, authLoading, user]);

    // ────────────────────────────────
    // クライアント側フィルタリング
    // ────────────────────────────────
    const posts = useMemo(() => {
        if (!user) return rawPosts;

        if (groupsLoading) {
            return rawPosts.filter((post) => {
                if (post.visibility === "public") return true;
                if (post.authorId === user.uid) return true;
                return false;
            });
        }

        return rawPosts.filter((post) => {
            const v = post.visibility;
            if (v === "public") return true;
            if (v?.startsWith("group:")) {
                const groupId = v.replace("group:", "");
                return allowedGroupIds.includes(groupId);
            }
            if (post.authorId === user.uid) return true;
            return false;
        });
    }, [rawPosts, user, groupsLoading, allowedGroupIds]);

    return { posts, loading };
}