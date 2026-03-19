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

    // 自分が所属しているグループ一覧を取得
    const { groups, loading: groupsLoading } = useUserGroups(userId);

    // グループIDの配列（メモ化して余計な再レンダリングを防ぐ）
    const allowedGroupIds = useMemo(() => groups.map((g) => g.id), [groups]);

    // グループ名のキャッシュ（再取得を防ぐためRefで保持）
    const groupNameCache = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        // raceId がまだ取得できていない場合は何もしない
        if (!raceId) return;

        // 認証状態がまだロード中なら待つ
        if (authLoading) return;

        const ref = collection(db, "races", raceId, "posts");

        // ────────────────────────────────
        // 未ログインの場合
        // ────────────────────────────────
        if (!user) {
            // where を使わず全件取得し、クライアント側で public だけに絞る
            // （Firestore のセキュリティルール上、where("visibility","==","public") だと
            //   未認証ユーザーが弾かれる可能性があるため）
            const q = query(ref, orderBy("createdAt", "desc"));

            const unsub = onSnapshot(
                q,
                (snap) => {
                    const list = snap.docs
                        .map((d) => ({ id: d.id, ...d.data() } as Post))
                        .filter((p) => p.visibility === "public"); // publicのみ表示

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
        // ログイン済みの場合
        // ────────────────────────────────

        // ① public な投稿を取得するクエリ
        const qPublic = query(
            ref,
            where("visibility", "==", "public"),
            orderBy("createdAt", "desc")
        );

        // ② 自分が投稿したもの（非公開・グループ投稿も含めて自分のは全部見える）
        const qOwn = query(
            ref,
            where("authorId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        // 各クエリの結果を別々に保持（onSnapshot のコールバックをまたいで参照するため let で宣言）
        let publicPosts: Post[] = [];
        let ownPosts: Post[] = [];

        // グループIDごとの投稿リストを管理するMap
        // 例: { "groupA": [post1, post2], "groupB": [post3] }
        const groupPostsMap = new Map<string, Post[]>();

        // Firestore ドキュメントを Post 型に変換するヘルパー関数
        const mapDoc = (d: QueryDocumentSnapshot<DocumentData>): Post => ({
            id: d.id,
            ...d.data(),
        } as Post);

        // public・own・group の投稿をまとめて重複排除 → グループ名付与 → ソートして state に反映
        const mergeAndUpdate = async (
            pub: Post[],
            own: Post[],
            group: Post[] // ★ グループ投稿を引数に追加
        ) => {
            // Map を使って id が重複しないようにマージ
            // （例：自分の public 投稿は pub にも own にも含まれるため）
            const map = new Map<string, Post>();
            for (const p of [...pub, ...own, ...group]) map.set(p.id, p); // ★ group も追加

            // グループ名を付与（visibility が "group:xxx" の形式のもの）
            const merged = await Promise.all(
                Array.from(map.values()).map(async (post) => {
                    let groupName: string | null = null;

                    if (post.visibility?.startsWith("group:")) {
                        const groupId = post.visibility.replace("group:", "");

                        // キャッシュにあればそれを使う（Firestoreへの余計なリクエストを減らす）
                        if (groupNameCache.current.has(groupId)) {
                            groupName = groupNameCache.current.get(groupId) ?? null;
                        } else {
                            // キャッシュになければ Firestore から取得してキャッシュに保存
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

            // 投稿日時の降順（新しい順）にソート
            merged.sort((a, b) => {
                const aTime = (a as any).createdAt?.seconds ?? 0;
                const bTime = (b as any).createdAt?.seconds ?? 0;
                return bTime - aTime;
            });

            setRawPosts(merged);
            setLoading(false);
        };

        // ① public 投稿のリスナー
        const unsubPublic = onSnapshot(
            qPublic,
            (snap) => {
                publicPosts = snap.docs.map(mapDoc);
                const allGroupPosts = Array.from(groupPostsMap.values()).flat();
                mergeAndUpdate(publicPosts, ownPosts, allGroupPosts);
            },
            (error) => {
                console.error("usePosts public error:", error);
                setLoading(false);
            }
        );

        // ② 自分の投稿のリスナー
        const unsubOwn = onSnapshot(
            qOwn,
            (snap) => {
                ownPosts = snap.docs.map(mapDoc);
                const allGroupPosts = Array.from(groupPostsMap.values()).flat();
                mergeAndUpdate(publicPosts, ownPosts, allGroupPosts);
            },
            (error) => {
                console.error("usePosts own error:", error);
                setLoading(false);
            }
        );

        // ③ 自分が所属するグループごとにリスナーを張る（★ここが追加部分）
        // allowedGroupIds = ["groupA", "groupB", ...] のように複数ある場合も対応
        const groupUnsubs = allowedGroupIds.map((groupId) => {
            const qGroup = query(
                ref,
                where("visibility", "==", `group:${groupId}`),
                orderBy("createdAt", "desc")
            );

            return onSnapshot(
                qGroup,
                (snap) => {
                    // このグループIDの投稿リストを更新
                    groupPostsMap.set(groupId, snap.docs.map(mapDoc));

                    // 全グループの投稿を平坦化してマージ
                    const allGroupPosts = Array.from(groupPostsMap.values()).flat();
                    mergeAndUpdate(publicPosts, ownPosts, allGroupPosts);
                },
                (error) => {
                    console.error(`usePosts group(${groupId}) error:`, error);
                }
            );
        });

        // クリーンアップ：コンポーネントがアンマウントされたときにリスナーを全て解除
        return () => {
            unsubPublic();
            unsubOwn();
            groupUnsubs.forEach((unsub) => unsub()); // ★ グループリスナーも忘れずに解除
        };

        // allowedGroupIds を依存配列に追加（グループ情報が変わったら再購読）
    }, [raceId, authLoading, user, allowedGroupIds]);

    // ────────────────────────────────
    // クライアント側フィルタリング
    // （Firestore から取得した rawPosts をさらに表示可否で絞り込む）
    // ────────────────────────────────
    const posts = useMemo(() => {
        // 未ログインなら rawPosts をそのまま返す（すでに public のみ）
        if (!user) return rawPosts;

        // グループ情報がまだロード中の場合は public と自分の投稿だけ先に表示
        if (groupsLoading) {
            return rawPosts.filter((post) => {
                if (post.visibility === "public") return true;
                if (post.authorId === user.uid) return true;
                return false;
            });
        }

        // グループ情報が揃ったら本来のフィルタリングを適用
        return rawPosts.filter((post) => {
            const v = post.visibility;
            if (v === "public") return true;
            if (v?.startsWith("group:")) {
                const groupId = v.replace("group:", "");
                // 自分が所属しているグループの投稿のみ表示
                return allowedGroupIds.includes(groupId);
            }
            // 自分の投稿は visibility に関わらず表示
            if (post.authorId === user.uid) return true;
            return false;
        });
    }, [rawPosts, user, groupsLoading, allowedGroupIds]);

    return { posts, loading };
}