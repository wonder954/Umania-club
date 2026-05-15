// src/lib/race/firestore.ts
import type { FirestoreRace } from "@/src/lib/race/types";
import { db } from "@/src/lib/firebase"; // ← Web SDK の db
import { collection, getDocs } from "firebase/firestore";

export async function getAllFirestoreRaces(): Promise<FirestoreRace[]> {
    const snap = await getDocs(collection(db, "races"));

    return snap.docs.map(doc => {
        const data = doc.data() as FirestoreRace;
        return {
            ...data,
            id: doc.id,
        };
    });
}
