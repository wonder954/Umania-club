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
        if (authLoading) return;
        if (!user || !userId) {
            setGroups([]);
            setLoading(false);
            return;
        }

        let unsub: (() => void) | null = null;

        user.getIdToken(true).then(() => {
            const q = query(
                collection(db, "groups"),
                where("members", "array-contains", userId)
            );

            unsub = onSnapshot(
                q,
                (snap) => {
                    setGroups(snap.docs.map((d) => ({
                        id: d.id,
                        ...(d.data() as Omit<Group, "id">),
                    })));
                    setLoading(false);
                },
                (error) => {
                    console.warn("useUserGroups onSnapshot error:", error);
                    setGroups([]);
                    setLoading(false);
                }
            );
        });

        return () => { unsub?.() };

    }, [userId, authLoading, user]);

    return { groups, loading };
}