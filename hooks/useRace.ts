"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { FirestoreRace } from "@/lib/race/types";   // ← 修正

export function useRace(raceId: string) {
    const [race, setRace] = useState<FirestoreRace | null>(null);   // ← 修正
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = String(raceId);

        // raceId が 10桁数字でない場合は無効
        if (!/^\d{10}$/.test(id)) {
            setRace(null);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const fetchRace = async () => {
            try {
                const ref = doc(db, "races", id);
                const snap = await getDoc(ref);

                if (cancelled) return;

                if (snap.exists()) {
                    const plain = JSON.parse(JSON.stringify(snap.data()));

                    // FirestoreRace は id を持つので raceId を補完
                    setRace({ id, ...plain } as FirestoreRace);   // ← 修正
                } else {
                    console.warn(`Race ${id} が存在しません`);
                    setRace(null);
                }
            } catch (e) {
                if (!cancelled) {
                    console.warn("useRace fetch failed:", e);
                    setRace(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchRace();

        return () => {
            cancelled = true;
        };
    }, [raceId]);

    return { race, loading };
}