import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Race } from "@/lib/races";

export function useRaceFirestore(raceId: string) {
    const [race, setRace] = useState<Race | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ref = doc(db, "races", raceId);

        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                setRace(snap.data() as Race);
            } else {
                setRace(null);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [raceId]);

    return { race, loading };
}