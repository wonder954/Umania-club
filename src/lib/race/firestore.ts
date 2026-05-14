import type { FirestoreRace } from "@/src/lib/race/types";
import { getAdminDb } from "../firebase-admin";

export async function getAllFirestoreRaces(): Promise<FirestoreRace[]> {
    const db = getAdminDb();
    const snap = await db.collection("races").get();

    return snap.docs.map(doc => {
    const data = doc.data() as FirestoreRace;
        return {
            ...data,      // ← 先に展開
            id: doc.id,   // ← 最後に上書き（これが正しい）
        };
    });
}
