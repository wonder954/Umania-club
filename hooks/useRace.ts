"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Race } from "@/lib/races";

export function useRace(raceId: string) {
    const [race, setRace] = useState<Race | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!raceId) return;

        const fetchRace = async () => {
            const ref = doc(db, "races", raceId);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setRace(snap.data() as Race);
            } else {
                setRace(undefined); // ← null ではなく undefined に統一
            }

            setLoading(false);
        };

        fetchRace();
    }, [raceId]);

    return { race, loading };
}