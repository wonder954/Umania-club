"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export type Group = {
    id: string;
    name: string;
    members: string[];
};

/**
 * useUserGroups
 *
 * - getDocs は「一回だけ取得」で、tokenの伝達タイミング次第で permission-denied になることがある
 * - onSnapshot に変更することで Firestore SDK の再接続・トークン更新を自動ハンドリングできる
 * - 未ログイン時は空配列を返す（groups は isLoggedIn() 必須のため）
 */
export function useUserGroups(userId?: string) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const { loading: authLoading, user } = useAuth();

    useEffect(() => {
        // 認証確定まで待つ
        if (authLoading) return;

        // 未ログイン or userId 未指定の場合は空を返す
        if (!user || !userId) {
            setGroups([]);
            setLoading(false);
            return;
        }

        // getDocs → onSnapshot に変更
        // これにより Firestore SDK が auth token の更新を自動的に処理し、
        // token 伝達タイミングによる permission-denied を回避できる
        const q = query(
            collection(db, "groups"),
            where("members", "array-contains", userId)
        );

        const unsub = onSnapshot(
            q,
            (snap) => {
                setGroups(
                    snap.docs.map((d) => ({
                        id: d.id,
                        ...(d.data() as Omit<Group, "id">),
                    }))
                );
                setLoading(false);
            },
            (error) => {
                // permission-denied はログのみ（未ログイン時の競合を防ぐ）
                console.warn("useUserGroups onSnapshot error:", error);
                setGroups([]);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [userId, authLoading, user]);

    return { groups, loading };
}