"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export function useUserGroups(userId?: string) {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetch = async () => {
            const q = query(
                collection(db, "groups"),
                where("members", "array-contains", userId)
            );
            const snap = await getDocs(q);
            setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLoading(false);
        };

        fetch();
    }, [userId]);

    return { groups, loading };
}