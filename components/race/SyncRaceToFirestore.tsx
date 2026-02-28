"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { Race } from "@/lib/races";

export default function SyncRaceToFirestore({ race }: { race: Race }) {
    useEffect(() => {
        if (!race) return;

        const ref = doc(db, "races", race.id);

        // JSON → Firestore 同期
        setDoc(ref, race, { merge: true });
    }, [race]);

    return null;
}