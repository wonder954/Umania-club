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

    // グループ名キャッシュ（N+1 防止）
    const groupNameCache = useRef<Map<string, string>>(new Map());

    // ── onSnapshot ──────────────────────────────────────────────────────────
    // 【重要】Firestoreルール isPostVisible は per-document 評価。
    // コレクションのリストクエリで visibility が "group:xxx" のドキュメントが含まれると、
    // ルール内の get() 呼び出しが拒否され permission-denied になる。
    //
    // 解決策: クエリを2つに分ける:
    //   1. visibility == "public" （未ログイン・ログイン済み共通）
    //   2. authorId == user.uid   （自分の投稿、ログイン済みのみ）
    // これにより group: visibility のドキュメントに対するルールの get() を回避する。
    // ──────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (authLoading) return;

        const ref = collection(db, "posts_all");

        // ── 未ログイン: public のみ ──
        if (!user) {
            const q = query(
                ref,
                where("raceId", "==", raceId),
                where("visibility", "==", "public"),
                orderBy("createdAt", "desc")
            );

            const unsub = onSnapshot(
                q,
                (snap) => {
                    const list = snap.docs.map((d) => {
                        const data = d.data();
                        return {
                            id: d.id,
                            ...data,
                            bets: Array.isArray(data.bets) ? data.bets : [],
                            likes: Array.isArray(data.likes) ? data.likes : [],
                            prediction: data.prediction ?? {},
                            comment: data.comment ?? "",
                            visibility: data.visibility ?? "public",
                            groupName: null,
                        } as Post;
                    });
                    setRawPosts(list);
                    setLoading(false);
                },
                (error) => {
                    console.error("usePosts onSnapshot error (unauthenticated):", error);
                    setLoading(false);
                }
            );
            return () => unsub();
        }

        // ── ログイン済み: public投稿 + 自分の投稿 の2クエリ ──
        const qPublic = query(
            ref,
            where("raceId", "==", raceId),
            where("visibility", "==", "public"),
            orderBy("createdAt", "desc")
        );
        const qOwn = query(
            ref,
            where("raceId", "==", raceId),
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
                bets: Array.isArray(data.bets) ? data.bets : [],
                likes: Array.isArray(data.likes) ? data.likes : [],
                prediction: data.prediction ?? {},
                comment: data.comment ?? "",
                visibility: data.visibility ?? "public",
                groupName: null,
            } as Post;
        };

        const mergeAndUpdate = async (pub: Post[], own: Post[]) => {
            // 重複除去（id をキーに Map で管理）
            const map = new Map<string, Post>();
            for (const p of [...pub, ...own]) map.set(p.id, p);

            // グループ名を補完
            const merged = await Promise.all(
                Array.from(map.values()).map(async (post) => {
                    let groupName: string | null = null;
                    if (post.visibility?.startsWith("group:")) {
                        const groupId = post.visibility.replace("group:", "");
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

            // createdAt 降順ソート
            merged.sort((a, b) => {
                const aTime = (a as Record<string, { seconds?: number }>).createdAt?.seconds ?? 0;
                const bTime = (b as Record<string, { seconds?: number }>).createdAt?.seconds ?? 0;
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
                console.error("usePosts public onSnapshot error:", error);
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
                console.error("usePosts own onSnapshot error:", error);
                setLoading(false);
            }
        );

        return () => {
            unsubPublic();
            unsubOwn();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [raceId, authLoading, user]);

    // ── クライアント側フィルタリング ────────────────────────────────────────
    const posts = useMemo(() => {
        if (!user) {
            // 未ログイン: public のみクエリ済み
            return rawPosts;
        }

        if (groupsLoading) {
            // グループ情報ロード中: public + 自分の投稿のみ
            return rawPosts.filter((post) => {
                const v = post.visibility;
                if (v === "public") return true;
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