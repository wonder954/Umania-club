"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Race } from "@/lib/races";

/**
 * races/{raceId} は Firestore Rules で `allow read: if true` なので認証不要。
 * authLoading ガードは削除し、raceId フォーマットチェックのみ行う。
 */
export function useRace(raceId: string) {
    const [race, setRace] = useState<Race | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // raceId が空、または 10桁数字でない場合はスキップ（権限エラーの根本原因）
        if (!raceId || !/^\d{10}$/.test(raceId)) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        const fetchRace = async () => {
            try {
                const ref = doc(db, "races", raceId);
                const snap = await getDoc(ref);

                if (cancelled) return;

                if (snap.exists()) {
                    setRace(snap.data() as Race);
                } else {
                    setRace(undefined);
                }
            } catch (e) {
                if (!cancelled) {
                    console.warn("useRace fetch failed:", e);
                    setRace(undefined);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchRace();

        return () => { cancelled = true; };
    }, [raceId]);

    return { race, loading };
}