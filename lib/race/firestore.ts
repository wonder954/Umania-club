import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FirestoreRace } from "@/lib/race/types";

/**
 * Firestore から全レースを取得
 */
export async function getAllFirestoreRaces(): Promise<FirestoreRace[]> {
    const ref = collection(db, "races");
    const snap = await getDocs(ref);

    const races: FirestoreRace[] = [];

    snap.forEach((doc) => {
        const data = doc.data() as FirestoreRace;
        races.push(data);
    });

    return races;
}