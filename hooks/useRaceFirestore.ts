import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Race } from "@/lib/races";

export function useRaceFirestore(raceId: string) {
    const [race, setRace] = useState<Race | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const ref = doc(db, "races", raceId);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setRace(snap.data() as Race);
            } else {
                setRace(null);
            }

            setLoading(false);
        }

        load();
    }, [raceId]);

    return { race, loading };
}