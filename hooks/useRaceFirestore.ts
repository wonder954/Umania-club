import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FirestoreRace } from "@/lib/race/types";

export function useRaceFirestore(raceId: string) {
    const [race, setRace] = useState<FirestoreRace | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ref = doc(db, "races", raceId);

        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                setRace(snap.data() as FirestoreRace);
            } else {
                setRace(null);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [raceId]);

    return { race, loading };
}