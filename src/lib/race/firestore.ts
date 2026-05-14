import { adminDb } from "../firebase-admin";
import type { FirestoreRace } from "@/src/lib/race/types";

export async function getAllFirestoreRaces(): Promise<FirestoreRace[]> {
    const snap = await adminDb.collection("races").get();

    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as FirestoreRace[];
}
