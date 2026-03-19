"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

import type { FirestoreRace } from "@/lib/race/types";
import type { RaceViewModel } from "@/viewmodels/raceViewModel";
import { toRaceViewModel } from "@/viewmodels/raceViewModel";

export function useRaceFirestore(raceId: string) {
    const [race, setRace] = useState<RaceViewModel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ref = doc(db, "races", raceId);

        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                const plain = JSON.parse(JSON.stringify(snap.data()));
                const fsRace = { id: raceId, ...plain } as FirestoreRace;

                setRace(toRaceViewModel(fsRace));
            } else {
                setRace(null);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [raceId]);

    return { race, loading };
}