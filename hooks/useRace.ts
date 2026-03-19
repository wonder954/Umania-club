"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import type { FirestoreRace } from "@/lib/race/types";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";
import { toRaceViewModel } from "@/viewmodels/raceViewModel";

export function useRace(raceId: string) {
    const [race, setRace] = useState<RaceViewModel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id = String(raceId);

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
                    const fsRace = { id, ...plain } as FirestoreRace;

                    setRace(toRaceViewModel(fsRace));
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